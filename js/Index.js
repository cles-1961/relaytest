"use strict";

var Vue_Datas = {
  // 原始資料
  Data_avg: 0,
  Data_sum: 0,
  Data_Array: [
    /*{
      "學號": "123",
      "name": "01",
      "velocity": 10
    }//*/
  ],

  // 設定
  calc_value: "velocity", // 計算值
  isInstead: true, // 是否代跑
  insteadCoe: 1, // 代跑係數

  dataKeys: ["學號", "name", "velocity"], // 目前資料欄位
  show_dataKeys: ["學號", "name", "velocity"], // 顯示的資料欄位  

  // 群組數據
  Group_Num: 2, // 群組數量
  Group: [{
    name: "1",
    Datas: [],
    average: 0,
    sum: 0
  }, {
    name: "2",
    Datas: [],
    average: 0,
    sum: 0
  }],

  // 資料輸出
  file_format: "CSV",
  file_name: "group"
}

var reader = new FileReader();

reader.onload = function (e) {
  let split_n = e.target.result.split("\n");

  Vue_Datas.Data_Array = []; Vue_Datas.Data_Array.length = 0;

  let Title_Array = split_n[0].split(",");

  Vue_Datas.dataKeys = Title_Array; // 儲存所有 title

  for (let i = 1; i < split_n.length; i++) {
    let Val_Array = split_n[i].split(",");
    let ValObj = {};

    Title_Array.forEach((Item, Index) => {
      ValObj[Item] = Val_Array[Index];
    });

    if (!ValObj[Vue_Datas.calc_value]) continue;

    Vue_Datas.Data_Array.push(ValObj);
  } // for
}

var vm = new Vue({
  el: ".Page",
  data: Vue_Datas,
  computed: {
  },
  watch: {
    Group_Num: {
      immediate: true,
      handler(newValue, oldValue) {
        this.init_group();
        let num = newValue - oldValue;
        for (let i = 0; i < Math.abs(num); i++) {
          if (num > 0)
            this.Group.push({
              name: (this.Group.length + 1) + "",
              Datas: [],
              average: 0,
              sum: 0
            });
          else
            this.Group.pop();
        } // for
      } // handler
    },
    Data_Array: function (value) {
      this.Data_sum = this.Data_Array.reduce(function (acc, curr, currentIndex, array) {
        return acc + parseFloat(curr[Vue_Datas.calc_value].trim());
      }, 0);

      this.Data_avg = this.Data_sum / this.Data_Array.length;

      this.Data_avg = parseInt(this.Data_avg * 100) / 100 // 取小數點後一位
      this.Data_sum = parseInt(this.Data_sum * 100) / 100 // 取小數點後一位
    },
    /*"Group": {
      handler: function (newVal, oldVal) {

      },
      deep: true
    }*/
  },
  methods: {
    calc_group: function () {
      this.init_group();
      let copy_dataArray = JSON.parse(JSON.stringify(this.Data_Array));

      // 每一群組先隨機放入一組資料
      //copy_dataArray.shuffle();

      // 由小排到大
      copy_dataArray.sort(function (a, b) {
        return parseFloat(a[Vue_Datas.calc_value]) > parseFloat(b[Vue_Datas.calc_value]) ? 1 : -1;
      });

      for (let i = 0; i < this.Group_Num; i++) {
        let Item = copy_dataArray.shift();
        this.Group[i].Datas.push(Item);
      } // for

      // 每次放一組資料，總共放 AllCount 次
      let AllCount = parseInt(copy_dataArray.length / this.Group_Num) + 1; // 可能無法整除，固+1
      for (let i = 0; i < AllCount; i++) {
        // 計算總和
        calc_group_sum_avg();

        // 根據每個群組目前 sum，放入數值，最大的群組放當次最小的資料
        let sort_array = [];
        this.Group.forEach((groupItem, Index) => {
          sort_array.push({
            groupIndex: Index,
            sum: groupItem.sum
          });
        });

        // 群組依 sum 排序，大到小
        sort_array.sort(function (a, b) {
          return parseFloat(a.sum) < parseFloat(b.sum) ? 1 : -1;
        });

        // 目前 sum 最大的群組放當次最小的資料
        for (let i = 0; i < this.Group_Num; i++) {
          if (copy_dataArray.length === 0) break; // 資料取完，結束

          let nowData = copy_dataArray.shift(); // 取出第一筆（最小）
          this.Group[sort_array[i].groupIndex].Datas.push(nowData);
        } // for
      } // for

      // 排序
      this.Group.forEach((groupItem, Index) => {
        groupItem.Datas.sort(function (a, b) {
          return parseFloat(a[Vue_Datas.calc_value]) < parseFloat(b[Vue_Datas.calc_value]) ? 1 : -1;
        });
      });

      calc_group_sum_avg();

      // 計算代跑
      if (!this.isInstead) return;

      // 無條件進位，取得最大群組人數
      let max_num = Math.ceil(this.Data_Array.length / this.Group_Num);

      let sum_avg = 0; // 所有多出人的群組的總和平均值
      let more_people_num = 0; // 多出人的群組數量
      this.Group.forEach((groupItem, Index) => {
        if (groupItem.Datas.length === max_num) {
          more_people_num++;
          sum_avg += groupItem.sum;
        }
      });

      // 沒有多人，不需要代跑
      if (more_people_num === this.Group.length) return;

      sum_avg /= more_people_num; // 計算平均

      console.log("sum_avg         : ", sum_avg);
      console.log("max_num         : ", max_num);
      console.log("more_people_num : ", more_people_num);

      // 加入代跑
      this.Group.forEach((groupItem, groupIndex) => {
        if (groupItem.Datas.length === max_num) return;

        // 沒有多人的群組
        let optimal_data = {}; // 最佳代跑
        let sum_sub = 999999; // 最小差值
        groupItem.Datas.forEach((dataItem, dataIndex) => {
          let this_sub = (parseFloat(dataItem[Vue_Datas.calc_value]) * Vue_Datas.insteadCoe
            + groupItem.sum) - sum_avg;

          if (sum_sub > Math.abs(this_sub)) {
            sum_sub = Math.abs(this_sub);
            optimal_data = JSON.parse(JSON.stringify(dataItem));
          } // if
        });

        optimal_data[Vue_Datas.calc_value] *= Vue_Datas.insteadCoe; // 根據代跑係數修正成績
        optimal_data[Vue_Datas.calc_value] = parseInt(optimal_data[Vue_Datas.calc_value] * 100) / 100

        optimal_data["isInstead"] = true; // 代跑員標記

        this.Group[groupIndex].Datas.push(optimal_data); // 加入群組
      });

      // 重新計算個群組平均
      calc_group_sum_avg();
    },
    read_Files() {
      let file = this.$refs.DataFile.files[0]

      reader.readAsText(file, "big5")
    },
    init_group() {
      this.Group.forEach((group, index) => {
        this.Group[index].Datas = [];
        this.Group[index].Datas.length = 0;

        this.Group[index].average = 0;
        this.Group[index].sum = 0;
      });
    },
    process_format() {
      switch (this.file_format) {
        case "CSV": {
          let concatArray = [];
          this.Group.forEach((group) => {
            concatArray = concatArray.concat(group.Datas);
          });

          return {
            datas: json2csv(concatArray),
            MIME: "csv"
          };
        }
      } // switch
    },
    download_datas() {
      let link = document.createElement("a");

      let dataObj = this.process_format();
      let data = dataObj.datas;
      let MIME = dataObj.MIME;

      link.download = this.file_name + "." + MIME;

      // UTF-8 BOM, Ref : https://stackoverflow.com/questions/19492846/javascript-to-csv-export-encoding-issue
      link.href = "data:" + MIME + ";charset=utf-8,%EF%BB%BF" + data;
      link.click();
    },
  }
});


function calc_group_sum_avg() {
  Vue_Datas.Group.forEach((groupItem, groupI) => {
    // 每筆數據都加入 groupName
    groupItem.Datas.forEach((dataItem, dataI) => {
      Vue_Datas.Group[groupI].Datas[dataI]["groupName"] = Vue_Datas.Group[groupI].name;
    });

    groupItem.sum = groupItem.Datas.reduce(function (acc, curr, currentIndex, array) {
      return acc + parseFloat(curr[Vue_Datas.calc_value]);
    }, 0);

    groupItem.average = groupItem.sum / groupItem.Datas.length;

    groupItem.sum = parseInt(groupItem.sum * 100) / 100 // 取小數點後 2 位
    groupItem.average = parseInt(groupItem.average * 100) / 100 // 取小數點後 2 位
  });
}


// 矩陣隨機排列
Array.prototype.shuffle = function () {
  var input = this;
  for (var i = input.length - 1; i >= 0; i--) {
    var randomIndex = Math.floor(Math.random() * (i + 1));
    var itemAtIndex = input[randomIndex];
    input[randomIndex] = input[i];
    input[i] = itemAtIndex;
  }
  return input;
}