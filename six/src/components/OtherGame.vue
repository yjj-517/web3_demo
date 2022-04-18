<template>
  <div class="game">
    <div class="game_box" v-loading="loading">
      <h1>推荐使用小狐狸</h1>
      <div class="game_box_playBox">
        <div class="game_box_player">
          <p>自己</p>
          <p>
            点数:<span>{{ num1 }}</span>
          </p>
          <p class="deposit">
            <span>押金</span>
            <el-input
              size="mini"
              v-model="money"
              placeholder="请下注"
            ></el-input>
            <el-button size="mini" type="info" @click="Bet">确定</el-button>
          </p>
        </div>
        <div class="game_box_player">
          <p>{{ opponent }}</p>
          <p>
            点数:<span>{{ num2 }}</span>
          </p>
          <p>{{ opponentSay }}</p>
        </div>
      </div>
      <div class="game_box_beginGame">
        <p>选择玩法</p>
        <el-button type="success" @click="withE">PvE</el-button>
        <el-button type="success" @click="withP">PvP</el-button>
        <el-button type="success" @click="test">测试</el-button>
      </div>
      <div class="game_box_resultBox">
        <p>最终结果:{{ result }}</p>
        <p>当前余额:{{ balance }} CZT</p>
        <p>当前账户:{{ accounts }}</p>
      </div>
      <div class="game_box_RechargeBox">
        <el-input placeholder="请输入数量" v-model="czt"></el-input>
        <el-button type="danger" @click="getCZT">充值CZT</el-button>
      </div>
      <div class="game_box_backBox">
        <el-button type="primary" @click="goBack">回到上一页</el-button>
        <el-button type="primary" @click="goHome">回到首页</el-button>
      </div>
    </div>
  </div>
</template>

<script>
// 自己的账户地址:0x7a3e4ACB8E428cba0800A3518666Ba2Df071E711;
// 加骏的账户地址:0xE9f6d5F43b6D61d6cC146aafCB3E5Af3C8f774E5;
// 磊哥的账户地址:0xCED27893eeA69b3fF1E57b5Ce40F19662e9296F5;
// 之前的网络环境:const rpcURL = "http://192.168.11.120:8547";

// 引入相关文件
import Web3 from "web3";
import { abi } from "../abi/ABI.json";

// 当前网络环境
const web3 = new Web3(window.web3.currentProvider); // 属性返回当前在用的通信服务提供器

// 新合约：
const address = "0xcAF35BA550ADFF051767f61bf8b1C6407CA2d150";

//token 合约ABI对象(JsonInterface)
const contract = new web3.eth.Contract(abi, address);

export default {
  name: "OtherGame",
  // 模板引入
  components: {},
  // 数据
  data() {
    return {
      money: "", // 下注金额
      opponent: "未知对手", // 对手
      opponentSay: "来玩亿把啊~", // 对手的话
      num1: 0, // 自己的点数
      num2: 0, // 对手的点数
      result: "", // 最终结果
      balance: "", // 当前余额
      accounts: "", // 当前账号
      czt: "", // 充值CZT的数量
      loading: false, // 加载状态
    };
  },
  // 方法
  methods: {
    // 回到首页
    goHome() {
      this.$router.push("/");
    },
    // 回到上一页
    goBack() {
      this.$router.push("/game");
    },
    // 查询余额
    watchBalanceOf() {
      contract.methods
        .balanceOf(this.accounts)
        .call({ from: this.accounts }, (err, result) => {
          console.log("balanceOf:", result);
          this.balance = result / 100;
        });
    },
    // 下注
    Bet() {
      // 修改加载状态(打开loading加载)
      this.loading = true;
      // 调用合约
      contract.methods
        .betForGame(this.money * 100)
        .send({ from: this.accounts })
        .then((res, err) => {
          console.log(res);
          // 成功时
          if (res) {
            // 修改加载状态(关闭loading加载)
            this.loading = false;
            // 弹窗提示
            this.$alert("下注成功", "提示", {
              confirmButtonText: "确定",
            });
            // 查询余额(更新)
            this.watchBalanceOf();
          } else {
            console.log(err);
            // 弹窗提示
            this.$alert("下注失败", "提示", {
              confirmButtonText: "确定",
            });
          }
        });
    },
    // 与合约游戏
    withE() {
      // 修改加载状态(打开loading加载)
      this.loading = true;
      // 调用合约
      contract.methods
        .startGameToContract()
        .send({ from: this.accounts })
        .then((res, err) => {
          console.log(res);
          // 成功时
          if (res) {
            // 修改加载状态(关闭loading加载)
            this.loading = false;
            // 弹窗提示
            this.$alert("游戏完成", "提示", {
              confirmButtonText: "确定",
            });
            // 清空押金
            this.money = "";
            let { returnValues } = res.events.gameResult;
            console.log(returnValues);
            // 数据处理
            var arr = [];
            for (const key in returnValues) {
              arr.push(returnValues[key]);
            }
            console.log(arr);
            // 赋值
            this.num1 = arr[0];
            this.num2 = arr[1];
            this.opponent = "电脑";
            // 根据点数，判断胜负
            if (this.num1 < this.num2) {
              this.result = "你输了" + Math.abs(arr[2] / 100) + "CZT";
              this.opponentSay = "不赌不知时运高，继续!";
            } else if (this.num1 == this.num2) {
              this.result = "平局";
              this.opponentSay = "这就是缘分啊，继续!";
            } else if (this.num1 > this.num2) {
              this.result = "你赢了" + Math.abs(arr[2] / 100) + "CZT";
              this.opponentSay = "有赌未为输，继续!";
            }

            // 查询余额(更新)
            this.watchBalanceOf();
          } else {
            console.log(err);
            // 弹窗提示
            this.$alert("游戏失败", "提示", {
              confirmButtonText: "确定",
            });
            // 清空押金
            this.money = "";
          }
        })
        .catch((err) => {
          console.log("这里返回的失败:", err);
          // 交易失败时
          // 修改加载状态(关闭loading加载)
          this.loading = false;
          // 对返回的失败信息做处理
          let str = err.message.substring(
            err.message.lastIndexOf(":") + 1,
            err.message.length
          );
          // 弹窗提示
          this.$alert(str, "提示", {
            confirmButtonText: "确定",
          });
        });
    },
    // 与玩家游戏
    withP() {
      // 修改加载状态(打开loading加载)
      this.loading = true;
      // 调用合约
      contract.methods
        .startGameToOtherOne()
        .send({ from: this.accounts })
        .then((res, err) => {
          console.log(res);
          // 成功时
          if (res) {
            // 修改加载状态(关闭loading加载)
            this.loading = false;
            // 弹窗提示
            this.$alert("游戏完成", "提示", {
              confirmButtonText: "确定",
            });
            // 数据处理
            let { returnValues } = res.events.gameResult;
            console.log(returnValues);
            var arr = [];
            for (const key in returnValues) {
              arr.push(returnValues[key]);
            }
            console.log(arr);
            // 赋值
            this.num1 = arr[0];
            this.num2 = arr[1];
            this.opponent = "玩家B";
            // 根据点数，判断胜负
            if (this.num1 == 0 && this.num2 == 0) {
              this.result = "很抱歉，当前没有玩家游戏，请等待~";
            } else if (this.num1 != 0 && this.num2 != 0) {
              if (this.num1 < this.num2) {
                this.result = "你输了" + Math.abs(arr[2] / 100) + "CZT";
              } else if (this.num1 == this.num2) {
                this.result = "平局";
              } else if (this.num1 > this.num2) {
                this.result = "你赢了" + Math.abs(arr[2] / 100) + "CZT";
              }
            } else {
              // 弹窗提示
              this.$alert("与玩家游戏失败", "提示", {
                confirmButtonText: "确定",
              });
            }
            // 清空押金
            this.money = "";

            // 查询余额(更新)
            this.watchBalanceOf();
          } else if (err) {
            // 弹窗提示
            this.$alert("与玩家游戏结果已出", "提示", {
              confirmButtonText: "确定",
            });
            // 修改最终结果
            this.result = "与玩家游戏结果已出";
            // 清空押金
            this.money = "";
          }
        })
        .catch((err) => {
          console.log("这里返回的失败:", err);
          // 交易失败时
          // 修改加载状态(关闭loading加载)
          this.loading = false;
          // 对返回的失败信息做处理
          let str = err.message.substring(
            err.message.lastIndexOf(":") + 1,
            err.message.length
          );
          // 弹窗提示
          this.$alert(str, "提示", {
            confirmButtonText: "确定",
          });
        });
    },
    // 测试
    test() {},
    // 充值CZT
    getCZT() {
      // 修改加载状态(打开loading加载)
      this.loading = true;
      // 调用合约
      contract.methods
        .playerMint(this.czt * 100)
        .send({ from: this.accounts })
        .then((res, err) => {
          console.log(res);
          if (res) {
            // 修改加载状态(关闭loading加载)
            this.loading = false;
            // 弹窗提示
            this.$alert("充值成功", "提示", {
              confirmButtonText: "确定",
            });
            // 查询余额(更新)
            this.watchBalanceOf();
            // 清空充值数量
            this.czt = "";
          } else {
            // 修改加载状态(关闭loading加载)
            this.loading = false;
            // 弹窗提示
            this.$alert("充值失败", "提示", {
              confirmButtonText: "确定",
            });
            // 清空充值数量
            this.czt = "";
            console.log(err);
          }
        });
    },
  },

  // 创建后
  created() {
    // 接受Game页面传过来的值(账号)
    this.accounts = this.$route.query.accounts;

    // 查询余额
    this.watchBalanceOf();
  },
  // 挂载后
  mounted() {},
  // 更新后
  updated() {},
};
</script>

<style scoped lang="less">
.game {
  .game_box {
    margin: auto;
    width: 30rem;
    height: 30rem;
    border: 0.1rem solid #000;
    display: flex;
    flex-direction: column;
    h1 {
      margin-top: 0.5rem;
    }
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
          justify-content: center;
          .el-input {
            width: 4.5rem;
            margin: 0 0.2rem;
          }
          span {
            margin-right: 0.3rem;
          }
        }
      }
    }
    .game_box_beginGame {
      display: flex;
      align-items: center;
      margin: 0 1rem;
      box-sizing: border-box;
      p {
        font-size: 1rem;
      }
      .el-button {
        margin-left: 3rem;
      }
    }
    .game_box_resultBox {
      font-size: 1rem;
      text-align: left;
      margin: 0.5rem 1rem;
      p {
        margin: 0.5rem 0;
      }
      .el-button {
        margin: 0 auto;
      }
    }
    .game_box_RechargeBox {
      display: flex;
      margin: 0 0 1rem 0;
      .el-input {
        width: 7rem;
        margin: 0 0.5rem 0 1rem;
      }
    }
    .game_box_backBox {
      display: flex;
      justify-content: space-between;
      padding: 1rem 2rem;
    }
  }
}
</style>
