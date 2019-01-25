package com.blueteam.wineshop.controller;

import com.blueteam.base.cache.redis.Redis;
import com.blueteam.base.conf.WxMpConfig;
import com.blueteam.base.constant.*;
import com.blueteam.base.util.*;
import com.blueteam.base.util.aliyun.SmsUtil;
import com.blueteam.base.util.weixin.WeiXinUtil;
import com.blueteam.entity.dto.*;
import com.blueteam.entity.po.*;
import com.blueteam.entity.po.winecoin.WineCoinRecord;
import com.blueteam.wineshop.mapper.ThirdPartyUserInfoMapper;
import com.blueteam.wineshop.mapper.UserMiddleThirdPartyMapper;
import com.blueteam.wineshop.service.*;
import com.blueteam.wineshop.service.wechatapplet.OrderService;
import jodd.util.Base64;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisCommands;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLDecoder;
import java.util.*;

import static com.blueteam.base.constant.DiamondConstant.WX_DATA;

/**
 * 用户控制器
 *
 * @author libra
 */
@Controller
@RequestMapping("/user")
public class UserController extends BaseController {

    //private Logger logger = LogManager.getLogger(this.getClass());
    org.slf4j.Logger logger= LoggerFactory.getLogger(this.getClass());
    @Autowired
    private WxUserService wxUserService;
    /**
     * 用户业务
     */
    @Autowired
    UserService userService;

    /**
     * 运营商业务
     */
    @Autowired
    CarriersService carriersService;

    /**
     * C端城市
     */
    @Autowired
    CityInfoService cityInfoService;

    /**
     * C端商家
     */
    @Autowired
    VendorInfoService vendorInfoService;

    /**
     * C端订单积分
     */
    @Autowired
    OrderService orderService;
    /*
    * 酒劵活动
    * */
    @Autowired
    private WineCouponService wineCouponService;
    /*
    * 酒币活动
    * */
    @Autowired
    private WineCoinService wineCoinService;

    /**
     * 微信签名
     */
    @Autowired
    private WechatSignService wechatSignService;

    @Autowired
    private WxMpConfig wxApiConfig;
    @Autowired
    private ThirdPartyUserInfoMapper thirdPartyUserInfoMapper;
    @Autowired
    private UserMiddleThirdPartyMapper userMiddleThirdPartyMapper;

    /**
     * 发送验证码
     *@param imageCode 图片验证码
     * @param phone 电话号码
     * @return
     */
    @RequestMapping("/sendCode")
    @ResponseBody
    public BaseResult sendCode(@RequestParam String phone, String imageCode,String uuid, HttpSession session) {
        JedisCommands redis = Redis.getJedis();
        String saveImageCode = redis.get( "image_code_"+uuid);
        if(saveImageCode != null && imageCode != null){
            imageCode = imageCode.toLowerCase();
            if(!imageCode.equals(saveImageCode)){
                return BaseResult.error("图片验证码错误");
            }
            else {
                redis.expire("image_code_"+uuid,0);
            }
        }
        String code= RandomUtils.genRandomNum(4);
        String template="SMS_123674741";
        String key = "user_binding_";
        if(SmsUtil.sendSms(phone,code,template)){

            key+=phone;
            redis.set(key,code);
            redis.expire(key,120);
            return BaseResult.success();
        }else{
            return BaseResult.error("发送验证码失败");
        }
    }
    /**
     * 发送图像验证码
     *
     * @param uuid 身份标识
     * @return
     */
    @RequestMapping(value = "/imageCode",method = RequestMethod.GET)
    public void imageCode(String uuid,HttpServletResponse response) {
        if(uuid != null && !uuid.equals("")){
            ValidateCode vCode = new ValidateCode(120,40,4,100);
            String key = "image_code_"+uuid;
            JedisCommands redis = Redis.getJedis();
            redis.set(key,vCode.getCode().toLowerCase());
            redis.expire(key,120);
            try {
                response.setCharacterEncoding("utf-8");
                response.setContentType("image/png; charset=utf-8");
                OutputStream os = response.getOutputStream();
                vCode.write(os);
            }
            catch (Exception e){
                e.printStackTrace();
            }
        }
    }

    /**
     * 登录
     * <p>
     * 账号
     *
     * @param code 校验码
     * @return
     */
    @ResponseBody
    @RequestMapping(value = {"/carriers/login", "/login"}, method = RequestMethod.POST)
    public BaseResult login(HttpSession session, @RequestParam String phone, @RequestParam String code) {
        if (phone == null || code == null)
            return ApiResult.error("参数错误");

        phone = phone.trim();
        code = code.trim();

        if (phone.isEmpty() || code.isEmpty())
            return ApiResult.error("参数错误");

        if (!VerificationUtil.VerificationCode(session, phone, code))
            return BaseResult.error("错误的验证码");


        ApiResult<UserInfo> user = (ApiResult<UserInfo>) userService.loginByPhone(phone, getIpAddr(), Constants.UserInfoDataSource.PHONE_CLIENT);

        if (!user.isSuccess())
            return user;
        //TODO:暂时没有考虑性能，后面可以重构
        UserInfo getUser = userService.getCityUserInfo(user.getData().getId());
        int extendId = 0;
        CarriersInfo carriers = null;
        if (isUserType(getUser.getUsertypes(), Enums.UserType.Carriers)) {
            carriers = carriersService.selectForUser(getUser.getId());
            if (carriers == null)
                return BaseResult.error("错误的运营商");
            extendId = carriers.getId();
        } else {
            return ApiResult.error("非运营商不能登录");
        }
        CarriersLoginResult result = new CarriersLoginResult();
        result.setAccount(user.getData().getUsername());
        result.setUserId(user.getData().getId());
        result.setUser(getUser);
        result.setCarriers(carriers);
        result.setToken(VerificationUtil.getToken(getUser, extendId, Enums.UserType.Carriers));
        return ApiResult.success(result);
    }

    /**
     * 商家登录
     *
     * @param telephone
     * @param code
     * @return
     */
    @ResponseBody
    @RequestMapping(value = {"/vendor/login"}, method = RequestMethod.POST)
    public BaseResult login4Vendors(String telephone, String code) {
        String key="code-register-"+telephone;
        if (!code.equals(Redis.getJedis().get(key))){
            return BaseResult.error("验证码错误");
        }
        try {
            BaseResult result = userService.login4Vendors(telephone, code);
            if (result.isSuccess()){
                userService.updateLoginTimes(telephone);
                Redis.getJedis().del(key);
            }
            return result;
        } catch (Exception e) {
            logger.error(ExceptionUtil.stackTraceString(e));
            e.printStackTrace();
            return BaseResult.error(e.getMessage());
        }
    }


    /**
     * 获取用户信息
     *
     * @param userId 用户ID
     * @return
     */
    @ResponseBody
    @RequestMapping("/get")
    @ApiLogin
    public BaseResult get(int userId) {
        if (userId <= 0)
            return BaseResult.error("没有查询到指定用户");
        UserInfo user = userService.getCityUserInfo(userId);

        return ApiResult.success(user);
    }

    /**
     * 杩斿洖棣栧瓧姣�
     *
     * @param strChinese
     * @param bUpCase
     * @return
     */
    public static String getPYIndexStr(String strChinese, boolean bUpCase) {
        try {
            StringBuffer buffer = new StringBuffer();
            byte b[] = strChinese.getBytes("GBK");//鎶婁腑鏂囪浆鍖栨垚byte鏁扮粍
            for (int i = 0; i < b.length; i++) {
                if ((b[i] & 255) > 128) {
                    int char1 = b[i++] & 255;
                    char1 <<= 8;//宸︾Щ杩愮畻绗︾敤鈥�<鈥濊〃绀猴紝鏄皢杩愮畻绗﹀乏杈圭殑瀵硅薄锛屽悜宸︾Щ鍔ㄨ繍绠楃鍙宠竟鎸囧畾鐨勪綅鏁帮紝骞朵笖鍦ㄤ綆浣嶈ˉ闆躲�鍏跺疄锛屽悜宸︾Щn浣嶏紝灏辩浉褰撲簬涔樹笂2鐨刵娆℃柟
                    int chart = char1 + (b[i] & 255);
                    buffer.append(getPYIndexChar((char) chart, bUpCase));
                    continue;
                }
                char c = (char) b[i];
                if (!Character.isJavaIdentifierPart(c))//纭畾鎸囧畾瀛楃鏄惁鍙互鏄�Java 鏍囪瘑绗︿腑棣栧瓧绗︿互澶栫殑閮ㄥ垎銆�
                    c = 'A';
                buffer.append(c);
            }
            return buffer.toString();
        } catch (Exception e) {
            System.out.println((new StringBuilder()).append("\u53D6\u4E2D\u6587\u62FC\u97F3\u6709\u9519").append(e.getMessage()).toString());
        }
        return null;
    }

    /**
     * 寰楀埌棣栧瓧姣�
     *
     * @param strChinese
     * @param bUpCase
     * @return
     */
    private static char getPYIndexChar(char strChinese, boolean bUpCase) {
        int charGBK = strChinese;
        char result;
        if (charGBK >= 45217 && charGBK <= 45252)
            result = 'A';
        else if (charGBK >= 45253 && charGBK <= 45760)
            result = 'B';
        else if (charGBK >= 45761 && charGBK <= 46317)
            result = 'C';
        else if (charGBK >= 46318 && charGBK <= 46825)
            result = 'D';
        else if (charGBK >= 46826 && charGBK <= 47009)
            result = 'E';
        else if (charGBK >= 47010 && charGBK <= 47296)
            result = 'F';
        else if (charGBK >= 47297 && charGBK <= 47613)
            result = 'G';
        else if (charGBK >= 47614 && charGBK <= 48118)
            result = 'H';
        else if (charGBK >= 48119 && charGBK <= 49061)
            result = 'J';
        else if (charGBK >= 49062 && charGBK <= 49323)
            result = 'K';
        else if (charGBK >= 49324 && charGBK <= 49895)
            result = 'L';
        else if (charGBK >= 49896 && charGBK <= 50370)
            result = 'M';
        else if (charGBK >= 50371 && charGBK <= 50613)
            result = 'N';
        else if (charGBK >= 50614 && charGBK <= 50621)
            result = 'O';
        else if (charGBK >= 50622 && charGBK <= 50905)
            result = 'P';
        else if (charGBK >= 50906 && charGBK <= 51386)
            result = 'Q';
        else if (charGBK >= 51387 && charGBK <= 51445)
            result = 'R';
        else if (charGBK >= 51446 && charGBK <= 52217)
            result = 'S';
        else if (charGBK >= 52218 && charGBK <= 52697)
            result = 'T';
        else if (charGBK >= 52698 && charGBK <= 52979)
            result = 'W';
        else if (charGBK >= 52980 && charGBK <= 53688)
            result = 'X';
        else if (charGBK >= 53689 && charGBK <= 54480)
            result = 'Y';
        else if (charGBK >= 54481 && charGBK <= 55289)
            result = 'Z';
        else
            result = (char) (65 + (new Random()).nextInt(25));
        if (!bUpCase)
            result = Character.toLowerCase(result);
        return result;
    }


    /***
     * 根据经纬度获取市-区域等
     *
     */
    @RequestMapping(value = "/Cityaddr", method = RequestMethod.GET)
    @ResponseBody
    public BaseResult cityList(@RequestParam("longitude") String longitude, @RequestParam("latitude") String latitude, final HttpServletRequest request) throws Exception {

        final String ip=getIp(request);
        new Thread(new Runnable(){//统计网站pv和uv
            @Override
            public void run() {saveVisitor(ip);}}).start();
        //通过高德地图接口逆地理编码
        City objCity = new City();
        String countyName = "武侯区";
        String adcode = "510107";
        String add = getAdd(longitude, latitude);
        if(!add.equals("")){
            JSONObject jsonObject = JSONObject.fromObject(add);
            if(jsonObject != null && jsonObject.getInt("status") == 1){
                JSONObject addressComponent = jsonObject.getJSONObject("regeocode").getJSONObject("addressComponent");
                if(addressComponent.getString("district") != null){
                    countyName = addressComponent.getString("district");
                    objCity.setCountyName(countyName);

                }
                if(addressComponent.getString("adcode") != null){
                    adcode = addressComponent.getString("adcode");
                }
                objCity.setCityName(addressComponent.getString("city"));
            }
        }
        //根据区县名称或adcode查询
        CityInfo objInfos = cityInfoService.selectCityCode(countyName);
        if(objInfos == null){
            objInfos = cityInfoService.getCityByAdcode(adcode);
        }
        if (objInfos != null) {
            objCity.setCityCode(objInfos.getCode().substring(0, objInfos.getCode().lastIndexOf("_")));
            objCity.setCounty(objInfos.getCode());
            return ApiResult.success(objCity);
        } else {
            return ApiResult.error("城市库没有该区域的维护");
        }
    }

    public static String getAdd(String log, String lat) {
        //lat 小  log  大
        //参数解释: 纬度,经度 type 001 (100代表道路，010代表POI，001代表门址，111可以同时显示前三项)
        //String urlString = "http://gc.ditu.aliyun.com/regeocoding?l=" + lat + "," + log + "&type=010";
        String urlString = "https://restapi.amap.com/v3/geocode/regeo?key=ca87ee2aac3439930eb2cdf4185886c8&location="+log+","+lat;
        String res = "";
        try {
            URL url = new URL(urlString);
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setDoOutput(true);
            conn.setRequestMethod("POST");
            java.io.BufferedReader in = new java.io.BufferedReader(new java.io.InputStreamReader(conn.getInputStream(), "UTF-8"));
            String line;
            while ((line = in.readLine()) != null) {
                res += line + "\n";
            }
            in.close();
        } catch (Exception e) {
            System.out.println("error in wapaction,and e is " + e.getMessage());
        }
        return res;
    }

    /*
    * 检查用户手机是否绑定
    * */
    @ResponseBody
    @RequestMapping("checkPhoneBinding")
    public  BaseResult checkPhoneBinding(@RequestParam String phone ){
        UserInfo userInfo = userService.getUserInfoByTelePhone(phone, Enums.UserType.Every, Enums.ThirdPartyUserInfo.WEI_XIN, ThirdPartyUserInfo.THIRD_PARTY_STATUS_BIND);
        int isBinding = 0;
        if(userInfo != null){
            List<ThirdPartyUserInfo> bindingWechats = userInfo.getThirdPartyUserInfos();
            if(bindingWechats != null && bindingWechats.size() > 0){
                for (ThirdPartyUserInfo thirdPartyUserInfo : bindingWechats){
                    if(thirdPartyUserInfo.getThirdPartyStatus() == 1){
                        isBinding = 1;
                        break;
                    }
                }
            }
        }

        Map res = new HashMap();
        res.put("bind_state",isBinding);
        return ApiResult.success(res);
    }

    /**
     * C端新增用户信息及绑定微信
     */
    @ResponseBody
    @RequestMapping(value = "/loginPhoneC", method = RequestMethod.POST)
    public BaseResult loginPhoneC(HttpSession session, @RequestParam(value = "CityCode", required = false) String CityCode, @RequestParam(value = "NickName", required = false) String NickName, @RequestParam(value = "HeadImage", required = false) String HeadImage, @RequestParam("WxOpenId") String WxOpenId,
                                  @RequestParam("phone") String phone, @RequestParam("code") String code, @RequestParam(value = "shareVendorId",required = false) Integer shareVendorId, HttpServletResponse response) throws Exception {
        String key = "user_binding_";
        JedisCommands redis = Redis.getJedis();
        key+=phone;
        if (!redis.exists(key) || !code.equals(redis.get(key))){
            return BaseResult.error("错误的验证码");
        }
        if (null == CityCode || CityCode.equals(""))
        {
            return BaseResult.error("未获取到定位信息");
        }
        if (null == NickName)
            NickName = "";
        if (null == HeadImage)
            HeadImage = "";
        if (NickName.equals("") || HeadImage.equals("")) {
            WxUser wxUser = wxUserService.getWxUserByOpendIdAndUnionId(WxOpenId, null);
            if (wxUser != null) {
                NickName = wxUser.getNickname();
                HeadImage = wxUser.getHeadImgUrl();
            }
        }
        UserInfo objInfo = userService.getThirdPartyUserInfo(WxOpenId, Enums.UserType.Every, Enums.ThirdPartyUserInfo.WEI_XIN, ThirdPartyUserInfo.THIRD_PARTY_STATUS_BIND);
        UserInfo userInfo = userService.getUserInfoByTelePhone(phone, Enums.UserType.Every, Enums.ThirdPartyUserInfo.WEI_XIN, ThirdPartyUserInfo.THIRD_PARTY_STATUS_BIND);
        LoginResult result = new LoginResult();
        if (objInfo == null && userInfo == null) {
            UserInfo objInfos = new UserInfo();
            objInfos.setUsername(phone);
            objInfos.setNickname(NickName);
            objInfos.setHeadimage(HeadImage);
            objInfos.setCitycode(CityCode);
            objInfos.setUsertypes(Enums.EnumUserType.Every.getValue());
            objInfos.setDatasource("SmallRoutine");
            objInfos.setLogintime(new Date());
            objInfos.setCreatedate(new Date());
            objInfos.setUpdatedate(new Date());
            objInfos.setTelephone(phone);
            userService.insert(objInfos);
            ThirdPartyUserInfo thirdPartyUserInfo = new ThirdPartyUserInfo();
            thirdPartyUserInfo.setThirdPartyId(WxOpenId);
            thirdPartyUserInfo.setThirdPartyNickName(NickName);
            thirdPartyUserInfo.setThirdPartyHeadImage(HeadImage);
            thirdPartyUserInfo.setUserType(Enums.UserType.Every);
            thirdPartyUserInfo.setThirdPartyType(Enums.ThirdPartyUserInfo.WEI_XIN);
            thirdPartyUserInfo.setThirdPartyStatus(ThirdPartyUserInfo.THIRD_PARTY_STATUS_BIND);
            thirdPartyUserInfo.setUpdateBy(phone);
            thirdPartyUserInfo.setCreateBy(phone);
            thirdPartyUserInfo.setUpdateDate(new Date());
            thirdPartyUserInfo.setCreateDate(new Date());
            thirdPartyUserInfoMapper.insertSelective(thirdPartyUserInfo);
            UserMiddleThirdParty userMiddleThirdParty = new UserMiddleThirdParty();
            userMiddleThirdParty.setThirdPartyId(thirdPartyUserInfo.getId());
            userMiddleThirdParty.setUserInfoId(objInfos.getId());
            userMiddleThirdParty.setMiddleStatus(ThirdPartyUserInfo.THIRD_PARTY_STATUS_BIND);
            userMiddleThirdPartyMapper.insertSelective(userMiddleThirdParty);
            objInfos.setJifen("0");
            result.setUser(objInfos);
            result.setToken(VerificationUtil.getToken(objInfos, Enums.UserType.Every));
            //注册完成获得酒劵
            Map couponRes = wineCouponService.userGetWineCoupon(objInfos.getId(),0,null,null);
            result.setWinCouponInfo(couponRes);
            //邀请注册增加商家酒币
            if(shareVendorId != null){
                WineCoinRecord wineCoinRecord = new WineCoinRecord();
                wineCoinRecord.setAmount(30);
                wineCoinRecord.setVendorId(shareVendorId);
                wineCoinRecord.setGiveRemark("新用户注册奖励");
                wineCoinRecord.setGiveType(2);
                wineCoinService.addWineCoinRecord(wineCoinRecord);
            }
            return ApiResult.success(result);
        } else if (objInfo != null && userInfo == null) {
            objInfo.setTelephone(phone);
            if (!Enums.FlagEnumHelper.HasFlag(objInfo.getUsertypes(), Enums.UserType.Every)) {//如果不是普通用户 者usertype需要修改状态
                int newType = objInfo.getUsertypes() + Enums.UserType.Every;
                objInfo.setUsertypes(newType);
            }
            userService.updateByPrimaryKey(objInfo);
            objInfo.setJifen(String.valueOf(orderService.getUserJifen(objInfo.getId())));
            result.setUser(objInfo);
            result.setToken(VerificationUtil.getToken(objInfo, objInfo.getUsertypes()));
            return ApiResult.success(result);
        } else if (objInfo == null && userInfo != null) {
            //如果手机已绑定微信，先解绑
            List<ThirdPartyUserInfo> bindingWechats = userInfo.getThirdPartyUserInfos();
            if(bindingWechats != null && bindingWechats.size() > 0){
                for (ThirdPartyUserInfo thirdPartyUserInfo : bindingWechats){
                    if(thirdPartyUserInfo.getThirdPartyStatus() == ThirdPartyUserInfo.THIRD_PARTY_STATUS_BIND){
                        thirdPartyUserInfo.setThirdPartyStatus(ThirdPartyUserInfo.THIRD_PARTY_STATUS_UNBIND);
                        thirdPartyUserInfo.setUpdateDate(new Date());
                        thirdPartyUserInfo.setUpdateBy(userInfo.getUsername());
                        thirdPartyUserInfoMapper.updateByPrimaryKeySelective(thirdPartyUserInfo);
                        UserMiddleThirdParty userMiddleThirdParty = new UserMiddleThirdParty();
                        userMiddleThirdParty.setMiddleStatus(ThirdPartyUserInfo.THIRD_PARTY_STATUS_UNBIND);
                        userMiddleThirdParty.setThirdPartyId(thirdPartyUserInfo.getId());
                        userMiddleThirdParty.setUserInfoId(userInfo.getId());
                        userMiddleThirdPartyMapper.updateByOtherIdStatus(userMiddleThirdParty);
                    }
                }
            }
            //建立绑定关系
            userInfo.setUsername(phone);
            userInfo.setCitycode(CityCode);
            userInfo.setNickname(NickName);
            userInfo.setHeadimage(HeadImage);
            ThirdPartyUserInfo thirdPartyUserInfo = new ThirdPartyUserInfo();
            thirdPartyUserInfo.setThirdPartyId(WxOpenId);
            thirdPartyUserInfo.setThirdPartyNickName(NickName);
            thirdPartyUserInfo.setThirdPartyHeadImage(HeadImage);
            thirdPartyUserInfo.setUserType(Enums.UserType.Every);
            thirdPartyUserInfo.setThirdPartyType(Enums.ThirdPartyUserInfo.WEI_XIN);
            thirdPartyUserInfo.setThirdPartyStatus(ThirdPartyUserInfo.THIRD_PARTY_STATUS_BIND);
            thirdPartyUserInfo.setUpdateBy(phone);
            thirdPartyUserInfo.setCreateBy(phone);
            thirdPartyUserInfo.setUpdateDate(new Date());
            thirdPartyUserInfo.setCreateDate(new Date());
            thirdPartyUserInfoMapper.insertSelective(thirdPartyUserInfo);
            UserMiddleThirdParty userMiddleThirdParty = new UserMiddleThirdParty();
            userMiddleThirdParty.setThirdPartyId(thirdPartyUserInfo.getId());
            userMiddleThirdParty.setUserInfoId(userInfo.getId());
            userMiddleThirdParty.setMiddleStatus(ThirdPartyUserInfo.THIRD_PARTY_STATUS_BIND);
            userMiddleThirdPartyMapper.insertSelective(userMiddleThirdParty);
            if (!Enums.FlagEnumHelper.HasFlag(userInfo.getUsertypes(), Enums.UserType.Every)) {//如果不是普通用户 者usertype需要修改状态
                int newType = userInfo.getUsertypes() + Enums.UserType.Every;
                userInfo.setUsertypes(newType);
            }
            userService.updateByPrimaryKey(userInfo);
            result.setUser(userInfo);
            result.setToken(VerificationUtil.getToken(userInfo, userInfo.getUsertypes()));
            return ApiResult.success(result);
        } else if (objInfo.getId() == userInfo.getId()) {
            objInfo.setJifen(String.valueOf(orderService.getUserJifen(objInfo.getId())));
            result.setUser(userInfo);
            result.setToken(VerificationUtil.getToken(userInfo, userInfo.getUsertypes()));
            return ApiResult.success(result);
        } else {
            return ApiResult.error("绑定失败");
        }
    }

    /**
     * C端登陆接口
     */
    @ResponseBody
    @RequestMapping(value = "/loginC", method = RequestMethod.POST)
    public BaseResult loginC(@RequestParam(value = "CityCode", required = false) String CityCode,
                             @RequestParam(value = "NickName", required = false) String NickName,
                             @RequestParam(value = "HeadImage", required = false) String HeadImage,
                             @RequestParam("WxOpenId") String WxOpenId,
                             HttpServletResponse response) throws Exception {
        UserInfo objInfo = userService.getThirdPartyUserInfo(WxOpenId, Enums.UserType.Every, Enums.ThirdPartyUserInfo.WEI_XIN, ThirdPartyUserInfo.THIRD_PARTY_STATUS_BIND);
        LoginResult result = new LoginResult();
        if (objInfo != null) {
            objInfo.setNickname(objInfo.getThirdPartyUserInfos().get(0).getThirdPartyNickName());
            objInfo.setHeadimage(objInfo.getThirdPartyUserInfos().get(0).getThirdPartyHeadImage());
            objInfo.setWxopenid(WxOpenId);
            if (null != objInfo.getTelephone()) {
                result.setUser(objInfo);
                objInfo.setJifen(String.valueOf(orderService.getUserJifen(objInfo.getId())));
                result.setToken(VerificationUtil.getToken(objInfo, Enums.UserType.Every));
                return ApiResult.success(result);
            } else {
                return ApiResult.error("手机号码缺失");
            }
        } else {
            return ApiResult.error("手机号码缺失");
        }
    }

    /**
     * 编辑用户信息
     *
     * @param param
     * @return
     */
    @RequestMapping(value = "/modify", method = RequestMethod.POST)
    @ResponseBody
    @ApiLogin
    public BaseResult modify(UserInfo param) {
        if (param == null || StringUtil.IsNullOrEmpty(param.getNickname())
                || StringUtil.IsNullOrEmpty(param.getTelephone()) || StringUtil.IsNullOrEmpty(param.getCitycode())
                || param.getId() == null)
            return BaseResult.error("参数错误");

        if (param.getId() != getCurrentUserID())
            return BaseResult.error("您不能修改其他用户的个人信息!");
        UserInfo user = userService.selectByPrimaryKey(param.getId());
        if (user == null)
            return BaseResult.error("没有找到对应的用户信息");

        user.setAddr(param.getAddr());
        user.setNickname(param.getNickname());
        user.setTelephone(param.getTelephone());
        user.setHeadimage(param.getHeadimage());
        user.setCitycode(param.getCitycode());

        try {
            int result = userService.updateByPrimaryKey(user);
            if (result > 0)
                return BaseResult.success();
        } catch (Exception e) {
            logger.error(e.getMessage(),e);
        }

        return BaseResult.error("修改用户信息错误");
    }

    /**
     * 获取用户积分
     */
    @ResponseBody
    @RequestMapping(value = "/getJifen", method = RequestMethod.GET)
    @ApiLogin
    public BaseResult getJifen(){
        Integer jifen = orderService.getUserJifen(this.getCurrentUserID());
        Map result = new HashMap();
        result.put("jifen",jifen);
        return ApiResult.success(result);
    }

    private static Map<String, Boolean> CODE_MAPS = new HashMap<String, Boolean>();

    /**
     * 监测验证码
     *
     * @param phone 手机号码
     * @param code  验证码
     * @return
     */
    @RequestMapping(value = "/checkVerificationCode", method = RequestMethod.POST)
    @ResponseBody
    @ApiLogin
    public BaseResult checkVerificationCode(HttpSession session, String phone, String code) {
        if (!VerificationUtil.VerificationCode(session, phone, code))
            return BaseResult.error("错误的验证码");

        String key = getToken() + phone;
        if (CODE_MAPS.containsKey(key))
            CODE_MAPS.remove(key);

        CODE_MAPS.put(key, true);
        return ApiResult.success(true);
    }

    /**
     * 修改用户登录名
     *
     * @param session
     * @param phone   手机号码
     * @param code    验证码
     * @return
     */
    @RequestMapping(value = "/modifyUserName", method = RequestMethod.POST)
    @ResponseBody
    @ApiLogin
    public BaseResult modifyUserName(HttpSession session, String phone, String code) {
        if (!VerificationUtil.VerificationCode(session, phone, code))
            return BaseResult.error("错误的验证码");

        UserInfo user = userService.selectByPrimaryKey(getCurrentUserID());
        if (user == null)
            return BaseResult.error("没有找到登录用户信息");


        String key = getToken() + user.getUsername();
        if (!CODE_MAPS.containsKey(key))
            return BaseResult.error("请先校验原登录手机");
        CODE_MAPS.remove(key);

        UserInfo phoneUser = userService.getUser(phone);
        if (phoneUser != null)
            return BaseResult.error("手机号码[" + phone + "]已被其他用户使用");

        user.setUsername(phone);
        user.setUpdatedate(new Date());
        int count = userService.updateByPrimaryKey(user);
        if (count > 0)
            return BaseResult.success();
        return BaseResult.error("修改登录手机成功，请更换登录手机重新登录!");
    }

    /**
     * 绑定设备
     *
     * @param token      设备号
     * @param deviceType 设备类型 取值 为   Device常量类里面的值
     * @return
     */
    @RequestMapping(value = "/bindDeviceToken", method = RequestMethod.POST)
    @ApiLogin
    @ResponseBody
    public BaseResult bindDeviceToken(String token, String deviceType) {
        if (StringUtil.IsNullOrEmpty(token) || StringUtil.IsNullOrEmpty(deviceType))
            return BaseResult.error("参数错误");

        if (!deviceType.equals(Device.ANDROID) && !deviceType.equals(Device.IOS))
            return BaseResult.error("设备类型参数错误");

        UserInfo userInfo = userService.getCityUserInfo(super.getCurrentUserID());

        token = deviceType + ":" + token;
        userInfo.setDevice_tokens(token);
        int count = userService.updateByPrimaryKey(userInfo);
        if (count > 0)
            return BaseResult.success();
        return BaseResult.error("绑定设备失败");
    }


    /**
     * 绑定商家微信OPENID
     *
     * @param aesOpenid
     * @return
     */
    @RequestMapping(value = "/bindVendorWx", method = RequestMethod.POST)
    @ApiLogin
    @ResponseBody
    public BaseResult bindVendorWx(@RequestParam("aesOpenid") String aesOpenid, @RequestParam("source") Integer source, @RequestParam("type") Integer type) {
        UserInfo userInfo = userService.selectByPrimaryKey(super.getCurrentUserID());
        if (userInfo == null)
            return BaseResult.error("错误的登录用户");
        UserInfo objInfo = userService.getThirdPartyUserInfo(aesOpenid, source, type, ThirdPartyUserInfo.THIRD_PARTY_STATUS_BIND);
        if (objInfo == null) {
            //openid没有绑定过商家
            ThirdPartyUserInfo thirdPartyUserInfo = new ThirdPartyUserInfo();
            thirdPartyUserInfo.setThirdPartyId(aesOpenid);
            thirdPartyUserInfo.setUserType(source);
            thirdPartyUserInfo.setThirdPartyType(type);
            thirdPartyUserInfo.setThirdPartyStatus(ThirdPartyUserInfo.THIRD_PARTY_STATUS_BIND);
            thirdPartyUserInfo.setUpdateBy(userInfo.getUsername());
            thirdPartyUserInfo.setCreateBy(userInfo.getUsername());
            thirdPartyUserInfo.setUpdateDate(new Date());
            thirdPartyUserInfo.setCreateDate(new Date());
            thirdPartyUserInfoMapper.insertSelective(thirdPartyUserInfo);
            UserMiddleThirdParty userMiddleThirdParty = new UserMiddleThirdParty();
            userMiddleThirdParty.setThirdPartyId(thirdPartyUserInfo.getId());
            userMiddleThirdParty.setUserInfoId(userInfo.getId());
            userMiddleThirdParty.setMiddleStatus(ThirdPartyUserInfo.THIRD_PARTY_STATUS_BIND);
            userMiddleThirdPartyMapper.insertSelective(userMiddleThirdParty);
            return BaseResult.success();
        } else {
            return BaseResult.error("该微信已经绑定了商家账号");
        }
    }

    /**
     * 方法的功能描述:TODO wxOpenId 和 telephone解除绑定
     * @param
     * @return
     * @methodName
     * @author xiaojiang 2017/8/23 14:32
     * @since 1.4.0
     */
    @RequestMapping(value = "/unbindWXOpenId", method = RequestMethod.POST)
    @ResponseBody
    public BaseResult unbindWXOpenId(@RequestParam(name = "wxOpenId", required = false) String wxOpenId, @RequestParam("telephone") String telephone, @RequestParam("source") Integer source, @RequestParam("type") Integer type) {
        UserInfo objInfo = userService.getUserInfoByTelePhone(telephone, source, type, ThirdPartyUserInfo.THIRD_PARTY_STATUS_BIND);
        if (objInfo != null) {
            List<ThirdPartyUserInfo> list = objInfo.getThirdPartyUserInfos();
            if (null != list && list.size() != 0) {
                boolean unBindTag = false;
                for(ThirdPartyUserInfo thirdPartyUserInfo : list){
                    if(thirdPartyUserInfo.getThirdPartyId().equals(wxOpenId)){
                        thirdPartyUserInfo.setThirdPartyStatus(ThirdPartyUserInfo.THIRD_PARTY_STATUS_UNBIND);
                        thirdPartyUserInfo.setUpdateDate(new Date());
                        thirdPartyUserInfo.setUpdateBy(objInfo.getUsername());
                        int i = thirdPartyUserInfoMapper.updateByPrimaryKeySelective(thirdPartyUserInfo);
                        UserMiddleThirdParty userMiddleThirdParty = new UserMiddleThirdParty();
                        userMiddleThirdParty.setMiddleStatus(ThirdPartyUserInfo.THIRD_PARTY_STATUS_UNBIND);
                        userMiddleThirdParty.setThirdPartyId(thirdPartyUserInfo.getId());
                        userMiddleThirdParty.setUserInfoId(objInfo.getId());
                        userMiddleThirdPartyMapper.updateByOtherIdStatus(userMiddleThirdParty);
                        unBindTag = true;
                    }
                }
                if(unBindTag){
                    return ApiResult.success("解绑成功");
                }
                else {
                    return ApiResult.error("解绑失败");
                }

            } else {
                return ApiResult.error("该手机号码没有绑定微信");
            }
        } else {
            return ApiResult.error("该手机号码没有绑定微信");
        }

    }



    /**
     * 找回密码
     * ljc 2018年1月24日 16:44:26
     * @return
     */
    @ResponseBody
    @RequestMapping(value = "/vendor/retrievePwd",method = RequestMethod.POST)
    public BaseResult retrievePwd(@RequestBody VendorLoginDTO dto){
        logger.info("params of /vendor/retrievePwd:{}",JsonUtil.serialize(dto));
        String key="code-retrieve-"+dto.getTelephone();
        if (!dto.getCode().equals(Redis.getJedis().get(key))){
            return BaseResult.error("验证码错误");
        }
        BaseResult result=userService.loginByPwd(dto.getTelephone(),dto.getPassword(),dto.getCode());
        if (result.isSuccess()){userService.updateLoginTimes(dto.getTelephone());Redis.getJedis().del(key);}
        return result;
    }


    /**
     * 密码登录
     * @return
     */
    @ResponseBody
    @RequestMapping(value = "/vendor/loginByPwd",method = RequestMethod.POST)
    public BaseResult loginByPwd(@RequestBody VendorLoginDTO dto){
        BaseResult result=userService.loginByPwd(dto.getTelephone(),dto.getPassword(),null);
        if (result.isSuccess()){userService.updateLoginTimes(dto.getTelephone());}
        return result;
    }


    /**
     * 发送验证码
     * @param telephone 电话号码
     * @return
     *
     */
    @ResponseBody
    @RequestMapping("/send/{param}")
    public BaseResult sendCheckCode(@PathVariable(value="param") String param,String telephone,String uuid,String imageCode) {
        if (jodd.util.StringUtil.isBlank(telephone)){
            return BaseResult.error("电话号码不能为空");
        }
        //短信验证码check图片验证码
        //if(param.equals("register") || param.equals("authentication")|| param.equals("account")){
            JedisCommands redis = Redis.getJedis();
            String saveImageCode = redis.get( "image_code_"+uuid);
            if(saveImageCode != null && imageCode != null){
                imageCode = imageCode.toLowerCase();
                if(!imageCode.equals(saveImageCode)){
                    return BaseResult.error("图片验证码错误");
                }
            }
//        }
        String code=RandomUtils.genRandomNum(4);
//        code="1234";
        String key=null;
        //SMS_123671337(认证)
        //SMS_123671328（修改密码）
        //SMS_123671326（商家注册）
        //SMS_130913152(绑定银行卡)
        String template="";
        if ("register".equals(param.trim())){//注册验证码
            key="code-register-"+telephone;
            template="SMS_123736164";
        }else if ("retrieve".equals(param)){//找回密码
            key="code-retrieve-"+telephone;
            template="SMS_123671328";
        }else if ("authentication".equals(param)){//商家验证
            key="code-authentication-"+telephone;
            template="SMS_123671337";
        }else if ("account".equals(param)){//银行卡验证
            key="code-bindAccount-"+telephone;
            template="SMS_130913152";
        }else {
            BaseResult.error("请求路径错误");
        }
        if(SmsUtil.sendSms(telephone,code,template)){
            Redis.getJedis().set(key,code);
            Redis.getJedis().expire(key,3*60);
            return BaseResult.success();
        }
        return BaseResult.error("短信发送失败");
    }


    /**
     * 修改密码
     * @return
     */
    @ResponseBody
    @RequestMapping( value = "/vendor/updatePwd",method = RequestMethod.POST)
    @VendorApiLogin
    public BaseResult updatePwd(@RequestBody VendorLoginDTO dto){

        System.out.println("params of /vendor/updatePwd"+JsonUtil.serialize(dto));
        return userService.updatePwd(dto.getOldPwd(),dto.getNewPwd(),this.getCurrentUserID());
    }

    /**
     * 设置密码
     * @return
     */
    @ResponseBody
    @RequestMapping( value = "/vendor/setPassword",method = RequestMethod.POST)
    @ApiLogin
    public BaseResult setPassword(@RequestBody VendorLoginDTO dto){
        dto.setOldPwd("set");
        return userService.updatePwd(dto.getOldPwd(),dto.getNewPwd(),this.getCurrentUserID());
    }

    /**
     * 修改登录账号(更换绑定手机号)
     * @return
     */
    @ResponseBody
    @RequestMapping( value = "/vendor/updateAccount",method = RequestMethod.POST)
    @VendorApiLogin
    public BaseResult updateAccount(@RequestBody VendorLoginDTO dto){
        logger.info("params of /vendor/updateAccount:{}",JsonUtil.serialize(dto));
        String key="code-register-"+dto.getTelephone();
        if (!dto.getCode().equals(Redis.getJedis().get(key))){
            return BaseResult.error("验证码错误");
        }
        BaseResult result=userService.updateAccount(dto.getTelephone(),this.getCurrentUserID());
        if (result.isSuccess()){Redis.getJedis().del(key);}
        return result;
    }
    /**
     * 方法的功能描述:TODO 小程序用户信息解密
     * @param
     * @return
     * @methodName
     * @author huangqijun 2018/6/5 11:26
     * @since 1.3.0
     */
    @RequestMapping(value = "/getWXUnionid", method = RequestMethod.GET)
    @ResponseBody
    public BaseResult decodeWXUserInfo(@RequestParam(required = true) String wxcode,
                                       @RequestParam(required = true) String encryptedData,
                                       @RequestParam(required = true) String iv) {
        Map<String, String> sParaTemp = new HashMap<String, String>();
        sParaTemp.put("appid", wxApiConfig.getSmallAppid());
        sParaTemp.put("secret", wxApiConfig.getSmallAppSecret());
        sParaTemp.put("js_code", wxcode);
        sParaTemp.put("grant_type", "authorization_code");
        Map<String, String> sPara = WeiXinUtil.paraFilter(sParaTemp);
        String prestr = WeiXinUtil.createLinkString(sPara);
        String result = WeiXinUtil.httpRequest("https://api.weixin.qq.com/sns/jscode2session", "GET", prestr);
        JSONObject jasonObject = JSONObject.fromObject(result);
       if(jasonObject.containsKey("session_key")){
           String openid = jasonObject.getString("openid");
           String sessionKey = jasonObject.getString("session_key");
           String unionId = null;
           if(jasonObject.containsKey("unionId")){
               unionId = jasonObject.getString("unionId");
           }
           else if(jasonObject.containsKey("unionid")){
               unionId = jasonObject.getString("unionid");
           }
           else {
               try {
                   //使用session_key解密用户数据
                   byte [] decriptByte = AES.decrypt(Base64.decode(encryptedData),Base64.decode(sessionKey),Base64.decode(iv));
                   if(decriptByte != null && decriptByte.length > 0){
                       String userInfo = new String(decriptByte,"UTF-8");
                       JSONObject userJson = JSONObject.fromObject(userInfo);
                       if(userJson.containsKey("unionId")){
                           //保存unionId和openId之间的映射
                           unionId = userJson.getString("unionId");
                       }
                   }
               }
               catch (Exception e){
                   e.printStackTrace();
               }
           }
           if(unionId != null){
               Map paramMap = new HashMap();
               paramMap.put("unionId",unionId);
               paramMap.put("openId",openid);
               paramMap.put("channel",1);
               String existOpenId = thirdPartyUserInfoMapper.getOpenIdByUnionId(paramMap);
               if(existOpenId != null){
                   thirdPartyUserInfoMapper.updateOpenIdByUnionId(paramMap);
               }
               else {
                   thirdPartyUserInfoMapper.addUnionOpenId(paramMap);
               }
               //返回unionId用作登陆唯一标识
               openid = unionId;
           }
           //返回结果
           Map resMap = new HashMap();
           resMap.put("openid",openid);
           return ApiResult.success(resMap);
       }
        return ApiResult.error("解密用户数据失败");
    }
    /**
     * 公众号获取微信用户openid及用户昵称，头像
     */
    @RequestMapping(value = "/getWXUserInfo", method = RequestMethod.GET)
    @ResponseBody
    public BaseResult getWXUserInfo(@RequestParam(required = true) String code) {
        Map<String, String> sParaTemp = new HashMap<String, String>();
        sParaTemp.put("appid", wxApiConfig.getFjjhAppId());
        sParaTemp.put("secret", wxApiConfig.getFjjhAppSecret());
        sParaTemp.put("grant_type", "authorization_code");
        sParaTemp.put("code",code);
        String prestr = WeiXinUtil.createLinkString(sParaTemp);
        //code换取access_token
        String result = WeiXinUtil.httpRequest("https://api.weixin.qq.com/sns/oauth2/access_token", "GET", prestr);
        JSONObject jasonObject = JSONObject.fromObject(result);
        if(jasonObject != null && jasonObject.containsKey("access_token")){
            String access_token = jasonObject.getString("access_token");
            String openid = jasonObject.getString("openid");
            //拉取用户信息
            sParaTemp.clear();
            sParaTemp.put("access_token",access_token);
            sParaTemp.put("openid",openid);
            sParaTemp.put("lang","zh_CN");
            prestr = WeiXinUtil.createLinkString(sParaTemp);
            result = WeiXinUtil.httpRequest("https://api.weixin.qq.com/sns/userinfo", "GET", prestr);
            jasonObject = JSONObject.fromObject(result);
            if(jasonObject != null && jasonObject.containsKey("nickname")){
                String nickname = jasonObject.getString("nickname");
                String headimgurl = jasonObject.getString("headimgurl");
                String unionid = jasonObject.getString("unionid");
                if(unionid == null || unionid.equals("")){
                    openid = jasonObject.getString("openid");
                }
                else {
                    //保存unionId和openId之间的映射
                    Map paramMap = new HashMap();
                    paramMap.put("unionId",unionid);
                    paramMap.put("openId",openid);
                    paramMap.put("channel",4);
                    String existOpenId = thirdPartyUserInfoMapper.getOpenIdByUnionId(paramMap);
                    if(existOpenId != null){
                        thirdPartyUserInfoMapper.updateOpenIdByUnionId(paramMap);
                    }
                    else {
                        thirdPartyUserInfoMapper.addUnionOpenId(paramMap);
                    }
                    //返回union做登陆唯一标识
                    openid = unionid;
                }
                Map resMap = new HashMap();
                resMap.put("nickname",nickname);
                resMap.put("headimg",headimgurl);
                resMap.put("openid",openid);
                return ApiResult.success(resMap);
            }
            else {
                return ApiResult.error("获取用户信息失败");
            }
        }
        else {
            return ApiResult.error("获取token失败");
        }
    }

    /*
    * 微信公众号接口签名函数
    * */
    @ResponseBody
    @RequestMapping("wechatSign")
    public Map signForShare(@RequestParam String url) throws Exception{
        Map<String, String> ret = wechatSignService.sign(wechatSignService.doGetTicket(), URLDecoder.decode(url, "utf-8"));
        return ret;
    }

    /**
     * 访客记录
     * @param request
     */
    private String getIp(HttpServletRequest request){
        String ip =null;
        try {
            ip = request.getHeader("X-forwarded-for");
            if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getHeader("Proxy-Client-IP");
            }
            if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getHeader("WL-Proxy-Client-IP");
            }
            if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getHeader("HTTP_CLIENT_IP");
            }
            if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getHeader("HTTP_X_FORWARDED_FOR");
            }
            if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getRemoteAddr();
            }
        }catch (Exception e){

        }
        return ip;
    }

    private void  saveVisitor(String ip){
        JedisCommands jedis=Redis.getJedis();
        String key1=DateUtil.format(new Date(),"yyyy-MM-dd");
        String key2=key1+ip;
        if (jedis.exists(key1)){
            //新增
            userService.inserVisitor();
        }else {
            if (jedis.exists(key2)){
                userService.updateVisitor(1,0,key1);
            }else {
                userService.updateVisitor(1,1,key1);
                jedis.set(key2, "key2");
                jedis.expire(key2, 24 * 60 * 60);
            }
            jedis.set(key1, "key1");
            jedis.expire(key1, 24 * 60 * 60);
        }
    }
}
