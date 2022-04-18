<template>
  <div id="Query">
    <h1>{{ msg }}</h1>
    <div class="query_box">
      <p class="query_box_p">
        <span class="query_content">transactionHash:</span
        ><el-input
          class="el-input"
          v-model="transactionHash"
          placeholder="请输入交易哈希值"
          clearable
        ></el-input>
      </p>
      <p class="query_box_p">
        <span class="query_content">blockNumber:</span
        ><el-input
          class="el-input"
          v-model="blockNumber"
          placeholder="请输入区块号"
          clearable
        ></el-input>
      </p>
      <p class="query_box_p">
        <span class="query_content">blockHash:</span
        ><el-input
          class="el-input"
          v-model="blockHash"
          placeholder="请输入区块哈希值"
          clearable
        ></el-input>
      </p>
      <p class="query_box_p">
        <span class="query_content">event:</span
        ><el-input
          class="el-input"
          v-model="event"
          placeholder="请输入查询事件"
          clearable
        ></el-input>
      </p>
      <p class="query_box_p">
        <el-button type="primary" @click="onScreen">筛选查询</el-button>
        <el-button type="success" @click="onEvent">所有事件查询</el-button>
      </p>
    </div>
    <!-- 展示内容 -->
    <div class="query_box2">
      <p class="query_box2_text">查询结果</p>
      <el-divider></el-divider>
      <div v-for="(item, i) in result" :key="i">
          <div>
              <p>address:{{item.address}}</p>
              <p>blockHash:{{item.blockHash}}</p>
              <p>blockNumber:{{item.blockNumber}}</p>
              <p>event:{{item.event}}</p>
              <p>transactionHash:{{item.transactionHash}}</p>
              <p>returnValues:{{item.returnValues}}</p>
              <el-divider></el-divider>
          </div>
      </div>
    </div>
  </div>
</template>

<script>

import Web3 from "web3";
// 智能合约生成的ABI参数，调用智能合约里的函数
import { abi } from "../assets/ABI/ABI.json";
const web3 = new Web3(
  Web3.givenProvider ||
    new Web3.providers.WebsocketProvider("ws://192.168.11.88:8545")
);

// 合约地址
const address = "0x5989415E7d0764e36EE7b0bc4b5B4cdcF87b1570";
// 通证智能合约的Javascript对象：
const contract = new web3.eth.Contract(abi, address);

export default {
  name: "Query",
  // 模板引入
  components: {},
  // 数据
  data() {
    return {
      msg: "Welcome to Query",
      result: [], //展示内容
      transactionHash: "", //绑定transactionHash
      blockNumber: "", //绑定blockNumber
      blockHash: "", //绑定blockHash
      event: "", //绑定event
    };
  },
  // 方法
  methods: {
    onEvent() {
      // getPastEvents读取合约历史事件
      contract.getPastEvents(
        "AllEvents", // 过滤事件参数，这里获取全部事件
        {
          filter: {
            //可选，按索引参数过滤事件
          },
          // 可选，仅读取从该编号开始的块中的历史事件,默认值为0
          fromBlock: 0, // 起始块
          // 可选，仅读取截止到该编号的块中的历史事件，默认值为"latest"
          toBlock: "latest", // 终止块
        },
        (err, events) => {
          //所有事件
          console.log(events);
          this.result = events;
        }
      );
    },
    onAll() {
      this.onEvent();
    },
    onScreen() {
      // 获取参数event
      let event = "AllEvents";
      if (this.event) {
        event = this.event;
      }
      // 获取参数blockNumber
      let fromBlock = 0;
      let toBlock = "latest";
      if (this.blockNumber) {
        fromBlock = this.blockNumber;
        toBlock = this.blockNumber;
      }
      // getPastEvents读取合约历史事件
      contract.getPastEvents(
        event, // 过滤事件参数，这里获取全部事件
        {
          filter: {
            //可选，按索引参数过滤事件
          },
          // 可选，仅读取从该编号开始的块中的历史事件,默认值为0
          fromBlock: fromBlock, // 起始块
          // 可选，仅读取截止到该编号的块中的历史事件，默认值为"latest"
          toBlock: toBlock, // 终止块
        },
        (err, events) => {
          //所有事件
          console.log(events);
          this.result = events;
          //  遍历筛选transactionHash
          //   let transactionHash = "";
          if (this.transactionHash) {
            // transactionHash = this.transactionHash;
            let arrEvent = events.filter((item) => {
              if (item.transactionHash == this.transactionHash) {
                // console.log(item);
                return item;
              }
            });
            // console.log(arrEvent);
            this.result = arrEvent;
          }
          //  遍历筛选transactionHash
          if (this.blockHash) {
            let arrEvent = events.filter((item) => {
              if (item.blockHash == this.blockHash) {
                // console.log(item);
                return item;
              }
            });
            // console.log(arrEvent);
            this.result = arrEvent;
          }
        }
      );
    },
  },
  // 创建后
  created() {},
  // 挂载后
  mounted() {},
  // 更新后
  updated() {},
};
</script>
<style lang="less" scoped>
#Query {
  width: 100%;
  padding-top: 2rem;
  h1 {
    color: rgb(112, 112, 9);
  }
}
.query_box {
  margin: auto;
  width: 34rem;
  border: 0.1rem solid #000;
  display: flex;
  flex-direction: column;
  .query_box_p {
    display: flex;
    justify-content: space-around;
    line-height: 4rem;
    .query_content {
      display: inline-block;
      width: 10rem;
    }
    .el-input {
      width: 20rem;
    }
  }
}
.query_box2 {
  margin: 2rem auto 0;
  width: 34rem;
  border: 0.1rem solid #000;
  .query_box2_text{
      font-size: 2rem;
      text-align: center;
      line-height: 5rem;
  }
}
</style>
