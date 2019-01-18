<style>
    @import "./../../css/Index/DateTimeComponent.css";
</style>
<template>
    <div class="dateTimeComponent">
        <div class="contents">
            <div class="menu displayFlex">
                <div class="menuItem" @click="cancelShow">取消</div>
                <div class="menuItem label">选择用车时间</div>
                <div class="menuItem" @click="confirm">确定</div>
            </div>
            <!--时间联动-->
            <div class="pickList">
                <mt-picker :slots="dateList" valueKey="name" :defaultIndex="selectDateTimeCode[0]" @change="dateSelect"></mt-picker>
                <mt-picker :slots="hoursList" valueKey="name" :defaultIndex="selectDateTimeCode[1]" @change="timeSelect"></mt-picker>
                <mt-picker :slots="minutesList" valueKey="name" :defaultIndex="selectDateTimeCode[2]" @change="minutesSelect"></mt-picker>
            </div>
        </div>
    </div>
</template>
<script>
    import DateTimeComponent from './js/DateTimeComponent.js'
    export default DateTimeComponent
</script>
