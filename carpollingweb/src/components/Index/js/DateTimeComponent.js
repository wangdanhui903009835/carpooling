import {getDateByNumber} from './../../../common/common.js'
export default{
  props:['objInfo'],
  data(){
    return{
      selectDateTimeCode:[0,0,0],//默认选中日期数据信息
      dateList:[
        {
          values:[],
          textAlign:'center'
        }
      ],
      hoursList:[
        {
          values:[],
          textAlign:'center',
          className:'hoursPicker'
        }
      ],
      minutesList:[
        {
          values:[],
          textAlgin:'center'
        }
      ]
    }
  },
  mounted(){
    const that = this;
    that.init();
  },
  methods:{
    init(){
      const that = this;
      that.getInitDate();//日期
      that.hoursList[0].values=[];
      that.minutesList[0].values=[];
    },
    //初始化小时
    getInitDate(){
      const that = this;
      let list=[];
      //创建日期选择数据
      let item_now={
        index:0,
        value:getDateByNumber(null,0).baDate,
        time:new Date().getTime(),
        name:'现在'
      },
      item_today={
        index:1,
        value:getDateByNumber(null,0).baDate,
        time:new Date().getTime(),
        name:'今天'
      },
      item_tomorrow={
         index:2,
         value:getDateByNumber(null,1).baDate,
         time:new Date(getDateByNumber(null,1).baDate).getTime(),
        name:'明天'
      },
      item_after_tomorrow={
        index:3,
        value:getDateByNumber(null,2).baDate,
        time:new Date(getDateByNumber(null,2).baDate).getTime(),
        name:'后天'
      }
      list.push(item_now);
      list.push(item_today);
      list.push(item_tomorrow);
      list.push(item_after_tomorrow);
      that.dateList[0].values=list
    },
    //初始化小时:0-24
    getInitHours(){
      const that = this;
      let selectDateTimeCode= that.selectDateTimeCode,list=[];
      if(selectDateTimeCode[0]==0){//现在
        return;
      }
      if(selectDateTimeCode[0]==1){//今天的时间选择
        //获取当前的时间
        let hours = new Date().getHours(),count=0;
        for(var i =hours;i<24;i++){
          let item = {
            index:count,
            value:i,
            name:that.$formatDateLength(i)+'点'
          }
          count++;
          list.push(item);
        }
      }else{//明天，后天的时间选择，全天24小时
        for(var i = 0;i<24;i++){
          let item = {
            index:i,
            value:i,
            name:that.$formatDateLength(i)+'点'
          }
          list.push(item);
        }
      }
      that.hoursList[0].values=list;
    },
    //初始化分钟
    getInitMinutes(){
      const that = this;
      let selectDateTimeCode= that.selectDateTimeCode,list=[];
      if(selectDateTimeCode[0]==0){//现在
        return;
      }
      let selectHours = that.hoursList[0].values[selectDateTimeCode[1]].value,//选择的时间
          currentHours = that.$formatDateLength(new Date().getHours()),//当前时间
          startIndex=0,
          count = 0;
      if(selectDateTimeCode[0]==1 && selectHours==currentHours){//今天
         startIndex = new Date().getMinutes();
      }
      for(var i = startIndex;i<60;i++){
        if(i%10==0){
          let item={
            index:count,
            value:i,
            name:that.$formatDateLength(i)+'分'
          }
          count++;
          list.push(item);
        }
      }
      that.minutesList[0].values=list
    },
    //日期选择
    dateSelect(picker,values){
      const that = this;
      if(values[0]){
        let _index = values[0].index;
        if(_index==0){//选择现在
          that.selectDateTimeCode[0]=_index;
          that.dateList[0].values[_index].value=new Date().getTime();
          that.hoursList[0].values=[];
          that.minutesList[0].values=[];
          return;
        }else{
          that.selectDateTimeCode[0]=_index;
          that.getInitHours();
          that.getInitMinutes();
        }
      }
    },
    //时间选择
    timeSelect(picker,values){
      const that = this;
      if(values[0]){
        that.selectDateTimeCode[1]=values[0].index;
        that.getInitMinutes();
      }
    },
    //分钟选择
    minutesSelect(picker,values){
      const that = this;
      if(values[0]){
        that.selectDateTimeCode[2]=values[0].index;
      }
    },
    //取消预约时间
    cancelShow(){
      const that = this;
      that.selectDateTimeCode=[0,0,0]
      that.init();
      that.$emit('cancelShow')
    },
    //选中预约时间
    confirm(){
      const that = this;
      let selectDateTimeCode=that.selectDateTimeCode,
          time={};
      if(selectDateTimeCode[0]==0){//现在
          time=that.dateList[0].values[selectDateTimeCode[0]].time;
      }else{
        let date = that.dateList[0].values[selectDateTimeCode[0]].value,
            hours=that.hoursList[0].values[selectDateTimeCode[1]].value,
            minutes = that.minutesList[0].values[selectDateTimeCode[2]].value;
        time = new Date(date+' '+hours+':'+minutes).getTime();
      }
      let objInfo = {
        time:time,
        defaultSelect:selectDateTimeCode
      }
      that.$emit('confirmShow',objInfo)
    }
  }
}