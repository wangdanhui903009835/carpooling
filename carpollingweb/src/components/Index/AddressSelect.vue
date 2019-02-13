<style>
    @import "./../../css/Index/AddressSelect.css";
</style>
<template>
    <!--地址选择信息-->
    <div class="indexAddressSelect">
        <div class="title displayFlex">
            <div class="city" @click="showCityList">
                <div class="cityName" v-if="countyName">
                    {{countyName}}
                    <img src="./../../images/angel.png">
                </div>
                <div class="nocity" v-else>选择城市</div>
            </div>
            <div class="poiSearch"><input type="text" id="searchText" v-model="searchText" placeholder="请输入查询地址"></div>
            <div class="cancel" @click="cancel">取消</div>
        </div>
        <div class="contents">
            <!--城市地址信息-->
            <div class="cityList" v-if="cityListShowFlag==1">
                <div class="listItem" v-for="(item,index) in cityList" @click="chooseCity(index)">{{item.name}}</div>
            </div>
            <!--推介地址信息-->
            <div class="recommentList" v-if="cityListShowFlag==2">
                <div v-for="(item,index) in poiList" @click="chooseRecommentItem(index)">
                    <div class="recommentItem displayFlex" v-if="recommentFlag">
                        <div class="text">{{item.name}}</div>
                        <div class="label">推荐<img src="./../../images/right.png"></div>
                    </div>
                    <div class="searchItem displayFlex" v-if="!recommentFlag">
                        <div class="textBox">
                            <div class="name">{{item.name}}</div>
                            <div class="text">{{item.pname}}{{item.cityname}}{{item.adname}}</div>
                        </div>
                        <div class="label"><img src="./../../images/right.png"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import AddressSelect from './js/AddressSelect.js'
    export default AddressSelect;
</script>
