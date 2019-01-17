<style>
    @import "./../css/Index/Index.css";
</style>
<template>
    <div class="Index">
        <!--地图显示信息-->
        <div class="container" id="container"></div>
        <div class="headImage" @click="showUserInfo(1)"><img src="./../images/defaultHeadImage.png"></div>
        <!--拼车、包车、预约-->
        <div class="carpoorCharter">
            <div class="menu displayFlex">
                <div class="menuItem" :class="selectStatus==1?'active':''" @click="changeSelect(1)">拼车</div>
                <div class="menuItem" :class="selectStatus==2?'active':''" @click="changeSelect(2)">包车</div>
                <div class="menuItem appointment">
                    <img src="./../images/index_car_appoint_out.png" v-if="selectStatus!=3" @click="changeSelect(3)">
                    <img src="./../images/index_car_appoint_in.png" v-if="selectStatus==3" @click="changeSelect(3)">
                </div>
            </div>
            <div class="destination">
                <div class="start displayFlex">
                    <div class="img">
                        <img src="./../images/start_address.png" class="iconImage">
                    </div>
                    <input type="text" v-model="startAddress">
                </div>
                <div class="end displayFlex">
                    <div class="img">
                        <img src="./../images/end_address.png" class="iconImage">
                    </div>
                    <input type="text" v-model="endAddress" placeholder="你要去哪儿">
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
                        <div class="menuItem displayFlex" @click="goTOrderList"><img src="./../images/order.png" class="icon"><div>订单</div></div>
                    </div>
                </div>
                <div class="transparentBlock" @click="showUserInfo(2)"></div>
            </div>
        </div>
    </div>
</template>
<script>
    import Index from './Index/Index.js';
    export default Index;
</script>
