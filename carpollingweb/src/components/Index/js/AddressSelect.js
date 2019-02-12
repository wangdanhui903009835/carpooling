export default{
  props:['objInfoProp'],
  data(){
    return{
      objInfo:{},
      cityName:'',//城市显示名称
      searchText:'',
      cityList:[
        {code:'0',value:'成都市',name:'成都市',city:'成都'},
        {code:'1',value:'巴中市巴州区',name:'巴州区',city:'巴中'},
        {code:'2',value:'巴中市恩阳区',name:'恩阳区',city:'巴中'},
        {code:'3',value:'巴中市平昌县',name:'平昌县',city:'巴中'},
        {code:'4',value:'巴中市通江县',name:'通江县',city:'巴中'},
        {code:'5',value:'巴中市南江县',name:'南江县',city:'巴中'}
      ],
      cityListShowFlag:0,
      poiList:[],
      recommentFlag:false,
    }
  },
  mounted(){
    const that = this;
    let info = JSON.parse(JSON.stringify(that.objInfoProp));
    that.objInfo = info
    that.cityName = info.city;
    if(!that.cityName){
      that.cityListShowFlag=1
    }else{
      that.citySearch('');
    }
  },
  methods:{
    //展示城市地区选择
    showCityList(){
      const that = this;
      that.cityListShowFlag=1
    },
    //选择城市信息
    chooseCity(index){
      const that = this;
      let item =that.cityList[index];
      that.cityListShowFlag=0;
      that.cityName=item.name;
      that.objInfo.getPriceText = item.value;
      that.objInfo.city = item.city;
      //推荐地址信息查询
      that.citySearch('');
    },
    //查询结果搜索
    citySearch(value){
      const that = this;
      that.cityListShowFlag=2;
      that.recommentFlag=true;
      that.searchAddress(value);
    },
    //推荐地址查询
    chooseRecommentItem(index){
      const that = this;
      let item = that.poiList[index],addressInfo=that.objInfo;
      addressInfo.text=addressInfo.city+'·'+item.name;
      addressInfo.location={
        latitude:item.location.lat,
        longitude:item.location.lng
      }
      that.$emit('confirmShowAddressSelect',addressInfo)
    },
    //poi地址查询信息
    searchAddress(inputValue){
      const that = this;
      that.poiList=[];
      AMap.service(["AMap.PlaceSearch"],function(){
        let placeSearch = new AMap.PlaceSearch({
          pageSize:20,
          city:that.cityName,
          citylimit:true,
          output:"json",
        })
        placeSearch.search(inputValue,function(status,data){
          if(status=='complete' && data.poiList.pois.length>0){//搜索结果完成
            that.poiList=data.poiList.pois;
          }
        })
      })
    },
    //取消地址选择
    cancel(){
      const that = this;
      that.$emit('cancelShowAddressSelect','123');
    }
  },
  watch:{
    'searchText':{
      handler(newValue,oldValue){
        const that = this;
        if(!newValue){
          that.recommentFlag=true;
        }else{
          that.recommentFlag=false;
        }
        that.searchAddress(newValue);
      }
    }
  }
}