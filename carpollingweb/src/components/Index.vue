<style>
    @import "./../css/Index/Index.css";
</style>
<template>
    <div class="Index">
        <!--地图显示信息-->
        <div class="container" id="container"></div>
        <div class="headImage" @click="showUserInfo(1)"><img src="./../images/defaultHeadImage.png"></div>
        <!--拼车、包车、预约-->
        <div class="carpoorCharter" :class="inputFoucs?'inputCarpoorCharter':''" v-if="!showDateTimeInfo.showFlag">
            <div class="position"><img src="./../images/position.png" @click="getReposition"></div>
            <div class="boxItem">
              <div class="contents">
                <div class="menu displayFlex">
                    <div class="menuItem" :class="selectStatus==0?'active':''" @click="changeSelect(0)">拼车</div>
                    <div class="menuItem" :class="selectStatus==1?'active':''" @click="changeSelect(1)">包车</div>
                    <div class="menuItem appointment">
                        <img src="./../images/index_car_appoint_out.png" v-if="showDateTimeInfo.appointFlag==0" @click="changeAppoint">
                        <img src="./../images/index_car_appoint_in.png" v-if="showDateTimeInfo.appointFlag===1" @click="changeAppoint">
                    </div>
                </div>
                <div class="destination">
                    <!--预约时间-->
                    <div class="appointTime" v-if="showDateTimeInfo.appointFlag==1">
                        <span class="time" @click="showSelectTime">预约时间</span>
                    </div>
                    <!--开始地址-->
                    <div class="start displayFlex">
                        <div class="img">
                            <img src="./../images/start_address.png" class="iconImage">
                        </div>
                        <input type="text" v-model="addressInfo.startAddress" placeholder="请输入开始地址" @focus="getFocus">
                    </div>
                    <!--结束地址-->
                    <div class="end displayFlex">
                        <div class="img">
                            <img src="./../images/end_address.png" class="iconImage">
                        </div>
                        <input type="text" v-model="addressInfo.endAddress" placeholder="你要去哪儿" @focus="getFocus" >
                    </div>
                    <!--错误提示信息-->
                    <div class="errorMsg" v-if="errorInfoMsg.errorMsg">提示:{{errorInfoMsg.errorMsg}}</div>
                </div>
            </div>
            </div>
            <div v-if="inputFoucs">
              <!--拼车人数和备注信息-->
              <div class="boxItem">
                <div class="numberRemarks">
                    <div class="item displayFlex">
                      <span class="label">乘车人数:</span>
                      <span class="value"><input type="text" v-model="userNum"/></span>
                    </div>
                    <div class="item displayFlex">
                      <span class="label">备注:</span>
                      <span class="value"><input type="text" v-model="remarks" placeholder="请输入备注信息"/></span>
                    </div>
                </div>
                <!--价格发布信息-->
                <div class="boxItem">
                  <div class="publishButton">
                      <div class="price" v-if="price>=0">￥{{price}}</div>
                      <div class="price" v-else>抱歉，暂不支持该区域信息</div>
                      <div class="publish" @click="confirmPublish">确认发布</div>
                  </div>
                </div>
            </div>
            </div>
      </div>
        <!--个人中心-->
        <div class="userInfo" :class="userInfo.showFlag==1?'showUserInfo':(userInfo.showFlag==2?'hideUserInfo':'')">
            <div class="contents displayFlex">
                <div class="menu">
                    <div class="img"><img src="./../images/defaultHeadImage.png"></div>
                    <div class="phone">{{userInfo.phone}}</div>
                    <div class="menuList">
                        <div class="menuItem displayFlex" @click="goTOrderList"><img src="./../images/order.png" class="icon"><div class="labelName">订单</div></div>
                    </div>
                </div>
                <div class="transparentBlock" @click="showUserInfo(2)"></div>
            </div>
        </div>
        <!--预约时间组件信息-->
        <DateTimeComponent :objInfo="showDateTimeInfo" v-if="showDateTimeInfo.showFlag" @cancelShow="cancelShow" @confirmShow="confirmShow"></DateTimeComponent>
    </div>
</template>
<script>
    import Index from './Index/js/Index.js'
    export default Index;
</script>
