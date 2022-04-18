<template>
  <div class="HistoryOrder">
    <h1>{{ msg }}</h1>
    <!-- 表单盒子 -->
    <div class="HistoryOrder_fromBox">
      <p>
        <span>blockHash:</span
        ><el-input
          placeholder="请输入内容"
          prefix-icon="el-icon-search"
          v-model="blockHash"
          clearable
        >
        </el-input>
      </p>
      <p>
        <span>blockNumber:</span
        ><el-input
          placeholder="请输入内容"
          prefix-icon="el-icon-search"
          v-model="blockNumber"
          clearable
        >
        </el-input>
      </p>
      <p>
        <span>event:</span
        ><el-input
          placeholder="请输入内容"
          prefix-icon="el-icon-search"
          v-model="event"
          clearable
        >
        </el-input>
      </p>
      <p>
        <span>transactionHash:</span
        ><el-input
          placeholder="请输入内容"
          prefix-icon="el-icon-search"
          v-model="transactionHash"
          clearable
        >
        </el-input>
      </p>
      <p class="Btn">
        <el-button type="primary" plain @click="filter">筛选查询</el-button>
        <el-button type="success" plain @click="all">查询所有</el-button>
        <el-button type="info" plain @click="goBack">返回上一页</el-button>
      </p>
    </div>
    <!-- 展示盒子 -->
    <h2>查询结果</h2>
    <div class="HistoryOrder_showBox">
      <p>{{ NewData }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "HistoryOrder",
  // 模板引入
  components: {},
  // 数据
  data() {
    return {
      msg: "Welcome to Your HistoryOrder",
      blockHash: "",
      blockNumber: "",
      event: "",
      transactionHash: "",
      contract: "", // 合约
      NewData: "", //查询到的事件
    };
  },
  // 方法
  methods: {
    // 筛选查询
    filter() {
      if (this.blockNumber == "" || this.transactionHash == "") {
        // 弹窗提示
        this.$alert("请输入必要的查询条件", "提示", {
          confirmButtonText: "确定",
        });
      } else {
        this.contract
          .getPastEvents("allEvents", {
            fromBlock: this.blockNumber,
            toBlock: "latest",
          })
          .then((events) => {
            console.log(events); // 打印所有结果
            // 循环当前区块所有的事件得到指定那条
            this.NewData = events.map((item) => {
              if (item.transactionHash == this.transactionHash) {
                return item;
              }
            });
            console.log(this.NewData);
          });
      }
    },
    // 查询所有
    all() {
      this.contract
        .getPastEvents("allEvents", {
          fromBlock: 0,
          toBlock: "latest",
        })
        .then((events) => {
          console.log(events); // 打印所有结果
          this.NewData = events;
        });
    },
    // 返回上一夜
    goBack() {
      this.$router.back();
    },
  },
  // 创建后
  created() {
    // 接受Game页面传过来的值(合约)
    this.contract = this.$route.query.contract;
  },
  // 挂载后
  mounted() {},
  // 更新后
  updated() {},
};
</script>

<style lang="less" scoped>
.HistoryOrder {
  // 表单盒子
  .HistoryOrder_fromBox {
    margin: 2rem auto;
    border: 0.1rem solid #000;
    width: 36rem;
    height: 24rem;
    display: flex;
    flex-direction: column;
    text-align: left;
    p {
      margin: 1rem 0;
      span {
        display: inline-block;
        width: 10rem;
        font-size: 20px;
        margin-left: 4rem;
      }
      .el-input {
        width: 18rem;
      }
    }
    .Btn {
      display: flex;
      justify-content: space-between;
      margin: 1rem 4rem;
    }
  }
  // 展示盒子
  .HistoryOrder_showBox {
    margin: 1rem auto;
    border: 0.1rem solid #000;
    width: 36rem;
    height: 40rem;
    overflow: scroll;
    p {
      font-size: 16px;
      text-align: left;
      width: 30rem;
      line-height: 2rem;
      word-wrap: break-word;
      margin-left: 2rem;
    }
  }
}
</style>
