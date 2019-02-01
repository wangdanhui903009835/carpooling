<style>
    @import "./../../css/Index/SelecNumber.css";
</style>
<template>
    <div class="selectNumber">
        <div class="contents">
            <div class="menu displayFlex">
                <div class="menuItem" @click="cancelShow">取消</div>
                <div class="menuItem label">请选择乘车人数</div>
                <div class="menuItem" @click="confirm">确定</div>
            </div>
            <div class="list">
                <div class="listItem displayFlex" :class="selectNumber==item.number?'active':''" v-for="(item,index) in list" @click="select(index)">
                    <div class="number"> {{item.number}}&nbsp;&nbsp;人</div>
                    <div class="img" v-if="selectNumber==item.number"><img src="./../../images/position_confirm.png"></div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    export default{
        props:['objInfo'],
        data(){
            return{
                list:[
                    {number:1},
                    {number:2},
                    {number:3},
                    {number:4},
                    {number:5},
                    {number:6},
                ],
                selectNumber:''
            }
        },
        mounted(){
            const that = this;
            that.selectNumber=that.objInfo.number;
            console.log(this.objInfo)
        },
        methods:{
            //选择订单编号
            select(index){
                const that = this;
                that.selectNumber=that.list[index].number;
            },
            //取消
            cancelShow(){
                const that = this;
                that.$emit('cancelShowSelect');
            },
            //确定
            confirm(){
                const that = this;
                that.$emit('confirmShowSelec',that.selectNumber);
            }

        },
    }
</script>
