<template>
  <div id="Wallet">
    <h1>{{ msg }}</h1>
    <div class="game_box" v-loading="loading">
      <div class="game_box_playBox">
        <div class="game_box_player">
          <p>玩家A</p>
          <p>
            点数:<span>{{ num1 }}</span>
          </p>
          <p class="deposit">
            <span>押金：</span>
            <el-input
              size="mini"
              v-model="money1"
              placeholder="请下注"
            ></el-input>
            <el-button size="mini" type="info" @click="pledge(money1)"
              >确定</el-button
            >
          </p>
        </div>
        <div class="game_box_player">
          <p>玩家B</p>
          <p>
            点数:<span>{{ num2 }}</span>
          </p>
          <p class="deposit">
            <!-- <span>押金：</span>
            <span>{{ money2 }}</span> -->
          </p>
        </div>
      </div>
      <!-- v-if="popup" -->
      <div>
        <p>选择游戏对手：</p>
        <el-button type="success" class="beginGame" @click="goContract()"
          >合约</el-button
        >
        <el-button type="success" class="beginGame" @click="goOpponent()"
          >玩家</el-button
        >
      </div>
      <div class="game_box_resultBox">
        <p>
          最终结果:
          {{ size }}
        </p>
        <p>
          当前余额:{{ balance }}CZT
          <el-button type="success" class="beginGame" @click="goCZT()"
            >添加10CZT</el-button
          >
        </p>
        <p>账户:{{ id }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import Web3 from "web3";
import { abi } from "../assets/ABI/ABI.json";
// import Tx from "ethereumjs-tx";
// const rpcURL = "http://192.168.11.88:8545";
// 合约地址
const address = "0xcAF35BA550ADFF051767f61bf8b1C6407CA2d150";

// 返回当前在用的通信服务提供器
const web3 = new Web3(window.web3.currentProvider);
// 不使用密钥签字，调用当前的钱包发起交易和调用智能合约
// 通证智能合约的Javascript对象：
const contract = new web3.eth.Contract(abi, address);

export default {
  name: "Wallet",
  // 模板引入
  components: {},
  // 数据
  data() {
    return {
      msg: "Welcome to Wallet（小狐狸代理交易）",
      id: "", //账户
      num1: 0, //自己点数
      num2: 0, //对手点数
      money1: "", //自己押金
      money2: 10, //对手押金
      balance: 0, //账户余额
      size: "请充值开始游戏", //结果
      judge: "失败", //弹窗提示语
      loading: false, //加载窗
    };
  },
  // 方法
  methods: {
    // 查询余额
    checkBalance() {
      contract.methods
        .balanceOf(this.id)
        .call({ from: this.id }, (err, result) => {
          console.log("balanceOf", err, result);
          this.balance = result / 100;
        });
    },
    // 质押押金betForGame
    async pledge(money1) {
      this.loading = true;
      await contract.methods
        .betForGame(money1 * 100)
        .send({ from: this.id })
        .then((res, err) => {
          // 加载，提示语
          this.loading = false;
          this.$alert("充值成功", {
            dangerouslyUseHTMLString: true,
          });
          console.log(res);
          console.log(err);
          this.checkBalance();
        })
        .catch((res, err) => {
          this.loading = false;
          // 错误回调
          console.log(res, err);
          this.checkBalance();
        });
    },
    //与合约游戏startGameToContract
    goContract() {
      this.loading = true;
      contract.methods
        .startGameToContract()
        .send({ from: this.id })
        .then((res, err) => {
          this.loading = false;
          this.checkBalance();
          console.log(res.events.gameResult.returnValues);
          console.log(err);
          this.num1 = res.events.gameResult.returnValues[0];
          this.num2 = res.events.gameResult.returnValues[1];
          this.size = res.events.gameResult.returnValues[2];
        })
        .catch((res, err) => {
          this.loading = false;
          this.checkBalance();
          // 错误回调
          console.log(res, err);
        });
    },
    // //与对手游戏startGameToOtherOne
    goOpponent() {
      this.loading = true;
      contract.methods
        .startGameToOtherOne()
        .send({ from: this.id })
        .then((res, err) => {
          this.loading = false;
          console.log(res.events);
          console.log(err);
          this.num1 = res.events.gameResult.returnValues[0];
          this.num2 = res.events.gameResult.returnValues[1];
          this.size = res.events.gameResult.returnValues[2];
          this.checkBalance();
        })
        .catch((res, err) => {
          this.loading = false;
          // 错误回调
          console.log(res, err);
          this.checkBalance();
        });
    },
    // // 添加CZT
    goCZT() {
      this.loading = true;
      contract.methods
        .playerMint(10 * 100)
        .send({ from: this.id })
        .then((res, err) => {
          console.log(res, err);
          this.loading = false;
        })
        .catch((res, err) => {
          this.loading = false;
          // 错误回调
          console.log(res, err);
          this.checkBalance();
        });
    },
    goCeshi() {},
  },
  // 创建后
  created() {
    // console.log(Web3);
    // 获取id值账号并赋值
    this.id = this.$route.query.id;
    this.checkBalance();
  },
  // 挂载后
  mounted() {
    // console.log(this.id);
  },
  // 更新后
  updated() {},
};
</script>
<style lang="less" scoped>
#Wallet {
  width: 100%;
  padding-top: 2rem;
  h1 {
    color: rgb(112, 112, 9);
  }
}

.game_box {
  margin: auto;
  width: 34rem;
  border: 0.1rem solid #000;
  display: flex;
  flex-direction: column;
  .game_box_playBox {
    display: flex;
    justify-content: center;
    .game_box_player {
      display: flex;
      flex-direction: column;
      margin: 1rem;
      height: 9rem;
      width: 13rem;
      line-height: 2rem;
      justify-content: space-around;
      border: 0.1rem solid #000;
      font-size: 1rem;
      .deposit {
        display: flex;
        // align-items: center;
        justify-content: center;
        .el-input {
          width: 4.5rem;
          margin: 0 0.2rem;
        }
      }
    }
  }
  .game_box_resultBox {
    font-size: 1rem;
    text-align: left;
    margin: 0 1rem;
    p {
      margin: 0.5rem 0;
    }
  }
  .beginGame {
    margin-left: 2rem;
    width: 8rem;
  }
}
</style>
