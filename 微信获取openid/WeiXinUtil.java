package com.blueteam.base.util.weixin;

import com.blueteam.base.util.DiamondUtil;
import com.blueteam.base.util.ExceptionUtil;
import com.blueteam.entity.dto.BaseResult;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.conn.socket.PlainConnectionSocketFactory;
import org.apache.http.conn.ssl.DefaultHostnameVerifier;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.BasicHttpClientConnectionManager;
import org.apache.http.params.CoreConnectionPNames;
import org.apache.http.ssl.SSLContexts;
import org.apache.http.util.EntityUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;
import org.springframework.core.io.ClassPathResource;

import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.Charset;
import java.security.KeyStore;
import java.security.SecureRandom;
import java.util.*;

import static com.blueteam.base.constant.DiamondConstant.GLOBAL_DATA;
import static com.blueteam.base.constant.DiamondConstant.WX_DATA;

/**
 * 微信支付工具类  微信公众号授权获取信息类
 *
 * @author ' ' 2017年2月28日
 * @version 1.0
 * @since 1.0 2017年2月28日
 */
public class WeiXinUtil {
    

    /**
     * MD5签名密钥
     *
     * @param text          需要签名的字符串
     * @param key           密钥
     * @param input_charset 编码格式
     * @return 签名结果
     * @author  2017年2月28日
     * @version 1.0
     * @since 1.0 2017年2月28日
     */
    public static String sign(String text, String key, String input_charset) {
        text = text + key;
        return DigestUtils.md5Hex(getContentBytes(text, input_charset));
    }

    /**
     * 签名字符串
     *
     * @param
     * @param sign          签名结果
     * @param
     * @param input_charset 编码格式
     * @return 签名结果
     */
    public static boolean verify(String text, String sign, String key, String input_charset) {
        text = text + key;
        String mysign = DigestUtils.md5Hex(getContentBytes(text, input_charset));
        if (mysign.equals(sign)) {
            return true;
        } else {
            return false;
        }
    }

    public static byte[] getContentBytes(String content, String charset) {
        if (charset == null || "".equals(charset)) {
            return content.getBytes();
        }
        try {
            return content.getBytes(charset);
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException("MD5签名过程中出现错误,指定的编码集不对,您目前指定的编码集是:" + charset);
        }
    }

    /**
     * 生成6位或10位随机数 param codeLength(多少位)
     *
     * @param codeLength
     * @return
     * @author 2017年2月28日
     * @version 1.0
     * @since 1.0 2017年2月28日
     */
    public static String createCode(int codeLength) {
        String code = "";
        for (int i = 0; i < codeLength; i++) {
            code += (int) (Math.random() * 9);
        }
        return code;
    }

    private static boolean isValidChar(char ch) {
        if ((ch >= '0' && ch <= '9') || (ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z'))
            return true;
        if ((ch >= 0x4e00 && ch <= 0x7fff) || (ch >= 0x8000 && ch <= 0x952f))
            return true;// 简体中文汉字编码
        return false;
    }


    /**
     * 除去数组中的空值和签名参数
     *
     * @param sArray 签名参数组
     * @return 去掉空值与签名参数后的新签名参数
     * @author  2017年2月28日
     * @version 1.0
     * @since 1.0 2017年2月28日
     */
    public static Map<String, String> paraFilter(Map<String, String> sArray) {
        Map<String, String> result = new HashMap<String, String>();
        if (sArray == null || sArray.size() <= 0) {
            return result;
        }
        for (String key : sArray.keySet()) {
            String value = sArray.get(key);
            if (value == null || value.equals("") || key.equalsIgnoreCase("sign")
                    || key.equalsIgnoreCase("sign_type")) {
                continue;
            }
            result.put(key, value);
        }
        return result;
    }

    /**
     * 把数组所有元素排序，并按照“参数=参数值”的模式用“&”字符拼接成字符串
     *
     * @param params 需要排序并参与字符拼接的参数组
     * @return 拼接后字符串
     * @author  2017年2月28日
     * @version 1.0
     * @since 1.0 2017年2月28日
     */
    public static String createLinkString(Map<String, String> params) {
        List<String> keys = new ArrayList<String>(params.keySet());
        Collections.sort(keys);
        String prestr = "";
        for (int i = 0; i < keys.size(); i++) {
            String key = keys.get(i);
            String value = params.get(key);
            if (i == keys.size() - 1) {// 拼接时，不包括最后一个&字符
                if (key.equals("total_fee")) {
                    prestr = prestr + key + "=" + mathRoundDouble(value);
                } else {
                    prestr = prestr + key + "=" + value;
                }
            } else {
                if (key.equals("total_fee")) {
                    prestr = prestr + key + "=" + mathRoundDouble(value) + "&";
                } else {
                    prestr = prestr + key + "=" + value + "&";
                }
            }
        }
        return prestr;
    }

    /**
     * 放回https接口
     *
     * @return
     * @author  2017年2月28日
     * @version 1.0
     * @since 1.0 2017年2月28日
     */
    public static String httpRequest(String requestUrl, String requestMethod, String outputStr) {
        // 创建SSLContext
        StringBuffer buffer = null;
        try {
            URL url = new URL(requestUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod(requestMethod);
            conn.setDoOutput(true);
            conn.setDoInput(true);
            conn.connect();
            //往服务器端写内容
            if (null != outputStr) {
                OutputStream os = conn.getOutputStream();
                os.write(outputStr.getBytes("utf-8"));
                os.close();
            }
            // 读取服务器端返回的内容
            InputStream is = conn.getInputStream();
            InputStreamReader isr = new InputStreamReader(is, "utf-8");
            BufferedReader br = new BufferedReader(isr);
            buffer = new StringBuffer();
            String line = null;
            while ((line = br.readLine()) != null) {
                buffer.append(line);
            }
        } catch (Exception e) {
            e.printStackTrace();
            logger.error(ExceptionUtil.stackTraceString(e));
        }
        if (buffer == null){
            return "";}
        return buffer.toString();
    }
    /**
     * 方法的功能描述: 退款工具类
     *@methodName
      * @param: null
     *@return
     *@since 1.4.0
     *@author  2018/1/23 17:23
     *@modifier
     */
    public static  Map<String, String> refundHttpRequest(String requestUrl, String data,Integer payChannel)throws Exception{
        String mchId = WeiXinUtil.SMALL_MCH_ID;
        String certName = WeiXinUtil.SMALL_MCH_CERT;
        if(payChannel == 4){
            //网页版支付
            mchId = WeiXinUtil.WECHAT_MCH_ID;
            certName = WeiXinUtil.WECHAT_MCH_CERT;
        }
        //指定读取证书格式为PKCS12
        org.springframework.core.io.Resource fileRource = new ClassPathResource(certName);
        InputStream instream = fileRource.getInputStream();
        KeyStore keyStore = KeyStore.getInstance("PKCS12");
        keyStore.load(instream, mchId.toCharArray());
        // 实例化密钥库 & 初始化密钥工厂
        KeyManagerFactory kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
        kmf.init(keyStore, mchId.toCharArray());

        // 创建 SSLContext
        SSLContext sslContext = SSLContext.getInstance("TLS");
        sslContext.init(kmf.getKeyManagers(), null, new SecureRandom());
        SSLConnectionSocketFactory sslConnectionSocketFactory = new SSLConnectionSocketFactory(
                sslContext,
                new String[]{"TLSv1"},
                null,
                new DefaultHostnameVerifier());

        BasicHttpClientConnectionManager connManager = new BasicHttpClientConnectionManager(
                RegistryBuilder.<ConnectionSocketFactory>create()
                        .register("http", PlainConnectionSocketFactory.getSocketFactory())
                        .register("https", sslConnectionSocketFactory)
                        .build(),
                null,
                null,
                null
        );

        HttpClient httpclient = HttpClientBuilder.create().setConnectionManager(connManager).build();
        try {
            // 设置响应头信息
            HttpPost httpost = new HttpPost(requestUrl);
            //设置请求和传输超时时间
            RequestConfig requestConfig = RequestConfig.custom().setSocketTimeout(10000).setConnectTimeout(10000).build();
            httpost.setConfig(requestConfig);
            // 构建消息实体
            StringEntity entitys = new StringEntity(data, "UTF-8");
            httpost.addHeader("Content-Type", "text/xml");
            httpost.setEntity(entitys);
            HttpResponse response = httpclient.execute(httpost);
            HttpEntity entity = response.getEntity();
            String jsonStr = EntityUtils.toString(entity, "UTF-8");
            System.out.println("退款结果"+jsonStr);
            return readStringXmlOut(jsonStr);
        } finally {
            instream.close();
        }
    }

    public static String urlEncodeUTF8(String source) {
        String result = source;
        try {
            result = java.net.URLEncoder.encode(source, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return result;
    }

    public static String mathRoundDouble(Object o) {
        Double d = Double.parseDouble(o.toString());
        if (Math.round(d) - d == 0D) {
            return String.valueOf(Math.round(d));
        }
        return String.valueOf(d);
    }
    /**
     * 方法的功能描述: 格式化xml
     *@methodName
     * @param: null
     *@return
     *@since 1.4.0
     *@author '' 2018/1/10 10:54
     *@modifier
     */
    public static String convertToXml(Object obj) {
        // 创建输出流
        StringWriter sw = new StringWriter();
        try {
            // 利用jdk中自带的转换类实现
            JAXBContext context = JAXBContext.newInstance(obj.getClass());
            Marshaller marshaller = context.createMarshaller();
            // 格式化xml输出的格式
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT,
                    Boolean.TRUE);
            // 将对象转换成输出流形式的xml
            marshaller.marshal(obj, sw);
        } catch (JAXBException e) {
            e.printStackTrace();
        }
        return sw.toString();
    }
    /**
     * 方法的功能描述: 把xml转化为map
     *@methodName
     * @param: null
     *@return
     *@since 1.4.0
     *@author xiaojiang 2018/1/10 13:51
     *@modifier
     */
    public static Map<String,String> readStringXmlOut(String xml) {
        Map<String,String> map = new HashMap<>();
        try {
            // 将字符串转为XML
            Document doc = DocumentHelper.parseText(xml);
            // 获取根节点
            Element rootElt = doc.getRootElement();
            //获取根节点下所有节点
            List<Element> list = rootElt.elements();
            //节点的name为map的key，text为map的value
            for (Element element : list) {
                map.put(element.getName(), element.getText());
            }
        } catch (DocumentException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return map;
    }
}
