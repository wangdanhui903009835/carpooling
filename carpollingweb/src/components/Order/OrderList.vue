<style>
    @import "./../../css/Order/OrderList.css";
</style>
<template>
    <div class="OrderList">
        <div class="orderItem" v-for="(item,index) in orderList" v-if="orderList.length>0" @click="goToDetail(index)">
            <div class="contents">
                <div class="title displayFlex">
                    <div class="status">
                       <span>{{getStatus(item.status)}}</span>
                    </div>
                    <div class="time">{{formateDate(item.date)}}</div>
                </div>
                <div class="orderNo">订单编号:{{item.orderId}}</div>
                <div class="addressName displayFlex">
                    <div :class="item.status==7?'orderGoing':'orderGoing'">
                        <div class="addressBox">
                            <div class="menuItem  displayFlex">
                                <img src="./../../images/start_address_1.png" class="menuIcon">
                                <div>{{item.start}}</div>
                            </div>
                            <div class="menuItem  displayFlex">
                                <img src="./../../images/end_address_1.png" class="menuIcon">
                                <div>{{item.destination}}</div>
                            </div>
                            <!--圈定点-->
                            <div class="dotDiv" id="dotDiv"><img src="./../../images/icon_menu.png"></div>
                        </div>
                        <div class="menuItem number" v-if="item.status==0">
                            <img src="./../../images/time_icon.png" class="menuIcon">
                            <div v-if="item.seatTime">{{formateDate(item.seatTime)}} &nbsp;{{item.userNum}}人乘车</div>
                            <span v-else>{{formateDate(item.date)}} &nbsp;{{item.userNum}}人乘车</span>
                        </div>
                    </div>
                    <div class="price" v-if="item.status==0">
                        <div class="priceTile">费用合计</div>
                        <div class="priceNumber">￥{{item.price}}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="noData" v-if="orderList.length==0">
            <div class="noDataContents" @click="goHome">
                <div>暂无订单数据信息<br/>点击返回首页</div>
                <img src="./../../images/go_home.png">
            </div>

        </div>
    </div>
</template>
<script>
    import OrderList from './js/OrderList.js'
    export default OrderList
</script>
