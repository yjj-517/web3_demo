<template>
  <div class="game">
    <div class="game_box" v-loading="loading">
      <h1>推荐使用私钥签署交易</h1>
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
        <el-button style="margin-left: 5.6rem" type="warning" @click="goHistory"
          >查看历史订单</el-button
        >
      </div>
      <div class="game_box_backBox">
        <el-button type="primary" @click="goOtherGame"
          >使用小狐狸操作</el-button
        >
        <el-button type="primary" @click="goHome">回到首页</el-button>
      </div>
    </div>
  </div>
</template>

<script>
// 自己的账户地址:0x7a3e4ACB8E428cba0800A3518666Ba2Df071E711;
// 加骏的账户地址:0xE9f6d5F43b6D61d6cC146aafCB3E5Af3C8f774E5;
// 磊哥的账户地址:0xCED27893eeA69b3fF1E57b5Ce40F19662e9296F5;

// 引入相关文件
import Web3 from "web3";
import { abi } from "../abi/ABI.json";
import Tx from "ethereumjs-tx";

// 当前网络环境
const web3 = new Web3(
  Web3.givenProvider ||
    new Web3.providers.WebsocketProvider("ws://192.168.11.88:8545")
);

// 新合约：
// const address = "0x22C628359aa70190fcaeb4009D2a7F6C61EFe8a9";
const address = "0xcAF35BA550ADFF051767f61bf8b1C6407CA2d150";

//token 合约ABI对象(JsonInterface)
const contract = new web3.eth.Contract(abi, address);

// 私钥(目前是从钱包导出来的)
const pk1 = "be6ee5499de140909d6a5483e448966a760c44f55d540b9019c3d134af2a1966"; //我的
//私钥转换为Buffer
const privateKey = Buffer.from(pk1, "hex");

export default {
  name: "Game",
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
      BetState: "失败", // 弹窗的提示信息
      loading: false, // 加载状态
      fn: "", // 判断执行哪个事件
    };
  },
  // 方法
  methods: {
    // 回到首页
    goHome() {
      this.$router.push("/");
    },
    // 去使用钱包页面
    goOtherGame() {
      this.$router.push({
        path: "/othergame",
        query: {
          accounts: this.accounts,
        },
      });
    },
    // 查看历史订单
    goHistory() {
      this.$router.push({
        path: "/historyorder",
        query: {
          contract,
        },
      });
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
    // 本地签署交易并发送
    contractF(data, account1) {
      // 构建交易对象并封装
      web3.eth.getTransactionCount(account1, async (err, txCount) => {
        const txObject = {
          nonce: web3.utils.toHex(txCount), // 这是账号的前一个交易计数,根据发送方地址实时获取
          to: address, // 目标账户,发布合约所产生的合约地址
          gasLimit: web3.utils.toHex(200000), // 交易能消耗Gas的上限
          gasPrice: web3.utils.toHex(web3.utils.toWei("6", "gwei")), // Gas价格
          data: data, // 被调用的智能合约函数的十六进制表示,由合约地址和abi构造成的合约对象，约对象调用合约源码方法得到
          chainId: web3.utils.toHex("84348"), // 连接到对应网络的链ID
          // value: web3.utils.toHex(web3.utils.toWei("0.1", "ether")), // 交易金额，一般合约交易不需要交易金额,默认0x0
        };

        // 签署交易
        const tx = new Tx(txObject);
        tx.sign(privateKey);

        const serializedTx = tx.serialize();
        const raw = "0x" + serializedTx.toString("hex");

        // 发送签名交易
        await web3.eth
          .sendSignedTransaction(raw)
          .then((res, err) => {
            console.log(res);
            // 成功时
            if (res) {
              // 修改加载状态(关闭loading)
              this.loading = false;
              // 弹窗提示
              this.$alert(this.BetState, "提示", {
                confirmButtonText: "确定",
              });
              // 查询余额(更新)
              this.watchBalanceOf();

              // 读取合约历史事件选到指定那个
              contract
                .getPastEvents("allEvents", {
                  fromBlock: res.blockNumber,
                  toBlock: res.blockNumber,
                })
                .then((events) => {
                  console.log(events); // 打印所有结果
                  // 循环当前区块所有的事件得到指定那条
                  let NewData = events.map((item) => {
                    if (item.transactionHash == res.transactionHash) {
                      console.log(item);
                      return item;
                    }
                  });
                  console.log(NewData);
                  if (this.fn == "betForGame") {
                    // 下注
                    console.log("betForGame");
                  } else if (this.fn == "startGameToContract") {
                    // 与合约游戏
                    console.log("startGameToContract");
                    // 数据处理
                    let { returnValues } = NewData[0];
                    var arr1 = [];
                    for (const key in returnValues) {
                      arr1.push(returnValues[key]);
                    }
                    console.log(arr1);
                    console.log(arr1[0]);
                    // 赋值
                    this.num1 = arr1[0];
                    this.num2 = arr1[1];
                    this.opponent = "电脑";
                    // 根据点数，判断胜负
                    if (this.num1 < this.num2) {
                      this.result = "你输了" + Math.abs(arr1[2] / 100) + "CZT";
                      this.opponentSay = "不赌不知时运高，继续!";
                    } else if (this.num1 == this.num2) {
                      this.result = "平局";
                      this.opponentSay = "这就是缘分啊，继续!";
                    } else if (this.num1 > this.num2) {
                      this.result = "你赢了" + Math.abs(arr1[2] / 100) + "CZT";
                      this.opponentSay = "有赌未为输，继续!";
                    }
                  } else if (this.fn == "startGameToOtherOne") {
                    // 与玩家游戏
                    console.log("startGameToOtherOne");
                    // 数据处理
                    let { returnValues } = NewData[0];
                    console.log(returnValues);
                    var arr2 = [];
                    for (const key in returnValues) {
                      arr2.push(returnValues[key]);
                    }
                    console.log(arr2);
                    // 赋值
                    this.num1 = arr2[0];
                    this.num2 = arr2[1];
                    this.opponent = "玩家B";
                    // 根据点数，判断胜负
                    if (this.num1 == 0 && this.num2 == 0) {
                      this.result = "很抱歉，当前没有玩家游戏，请等待~";
                    } else if (this.num1 != 0 && this.num2 != 0) {
                      if (this.num1 < this.num2) {
                        this.result =
                          "你输了" + Math.abs(arr2[2] / 100) + "CZT";
                      } else if (this.num1 == this.num2) {
                        this.result = "平局";
                      } else if (this.num1 > this.num2) {
                        this.result =
                          "你赢了" + Math.abs(arr2[2] / 100) + "CZT";
                      }
                    } else {
                      // 弹窗提示
                      this.$alert("与玩家游戏失败", "提示", {
                        confirmButtonText: "确定",
                      });
                    }
                  }
                  // 清空押金
                  this.money = "";
                });
            } else if (err) {
              // 修改加载状态(关闭loading)
              this.loading = false;
              console.log("失败", err);
              // 弹窗提示
              this.$alert("失败", "提示", {
                confirmButtonText: "确定",
              });
            }
          })
          .catch((err) => {
            // 清空押金
            this.money = "";

            // 上链失败
            console.log("上链失败", err);
            // 修改加载状态(关闭loading加载)
            this.loading = false;
            // 弹窗提示
            this.$alert("错误提示:" + this.BetState, "提示", {
              confirmButtonText: "确定",
            });
          });
      });
    },
    // 下注
    async Bet() {
      if (this.money <= 0 || this.money == "") {
        // 弹窗提示
        this.$alert("您输入的押金应该为大于0的数", "提示", {
          confirmButtonText: "确定",
        });
        // 清空押金
        this.money = "";
      } else if (this.money > 0) {
        // 修改加载状态(打开loading加载)
        this.loading = true;
        // 传入合约需要的参数
        let data = contract.methods.betForGame(this.money * 100).encodeABI();
        // 给定指定字符做判断
        this.fn = "betForGame";
        // 调用合约
        await this.contractF(data, this.accounts);
        // 使用call再次调用,完成一些前端操作
        await contract.methods
          .betForGame(this.money * 100)
          .call({ from: this.accounts })
          .then((res, err) => {
            // 当拿到返回值时
            if (res) {
              // 修改弹窗提示信息
              this.BetState = "下注成功";
            } else if (err) {
              // 当报错时
              // 修改弹窗提示信息
              this.BetState = "下注失败";
            }
          }) // 交易失败时
          .catch((err) => {
            // 对返回的失败信息做处理
            // 修改弹窗提示信息
            this.BetState = JSON.parse(err.message.split("error.")[1]).message;
          });
      }
    },
    // 与合约游戏
    async withE() {
      // 修改加载状态(打开loading加载)
      this.loading = true;
      // 传入合约需要的参数
      let data = contract.methods.startGameToContract().encodeABI();
      // 给定指定字符做判断
      this.fn = "startGameToContract";
      // 调用合约
      await this.contractF(data, this.accounts);
      // 与合约游戏调返回值
      this.withERes();
    },
    // 与合约游戏调返回值
    withERes() {
      // 使用call再次调用拿到返回值，最后做一些操作
      contract.methods
        .startGameToContract()
        .call({ from: this.accounts })
        .then((res, err) => {
          // 当成功时
          if (res) {
            this.BetState = "游戏完成";
          } else if (err) {
            // 修改弹窗提示信息
            this.BetState = "游戏失败";
          }
        })
        .catch((err) => {
          console.log("这里返回的失败:", err);
          // 交易失败时
          // 修改加载状态(打开loading加载)
          this.loading = true;
          // 对返回的失败信息做处理
          // 修改弹窗提示信息
          this.BetState = JSON.parse(err.message.split("error.")[1]).message;
        });
    },
    // 与玩家游戏
    async withP() {
      // 传入合约需要的参数
      let data = contract.methods.startGameToOtherOne().encodeABI();
      // 调用合约
      await this.contractF(data, this.accounts);
      // 给定指定字符做判断
      this.fn = "startGameToOtherOne";
      // 与玩家游戏返回值
      this.withPRes();
    },
    // 与玩家游戏返回值
    withPRes() {
      // 使用call再次调用智能合约的对应方法获取相应返回值
      contract.methods
        .startGameToOtherOne()
        .call({ from: this.accounts })
        .then((res, err) => {
          // 修改加载状态
          this.loading = true;
          if (res) {
            this.BetState = "游戏完成";
          } else if (err) {
            // 修改弹窗提示信息
            this.BetState = "与玩家游戏结果已出";
            // 修改最终结果
            this.result = "与玩家游戏结果已出";
          }
        })
        .catch((err) => {
          console.log("这里返回的失败:", err);
          // 交易失败时
          // 修改加载状态(打开loading加载)
          this.loading = true;
          // 对返回的失败信息做处理
          // 修改弹窗提示信息
          this.BetState = JSON.parse(err.message.split("error.")[1]).message;
        });
    },
    // 测试
    test() {},
    // 充值CZT
    getCZT() {
      let data = contract.methods.playerMint(this.czt * 100).encodeABI();
      this.contractF(data, this.accounts);

      contract.methods
        .playerMint(this.czt * 100)
        .call()
        .then((res, err) => {
          // 修改加载状态
          this.loading = true;
          // 拿到返回值时
          if (res) {
            // 修改弹窗提示信息
            this.BetState = "充值成功";
            // 清空充值数量
            this.czt = "";
          } else if (err) {
            console.log(err);
          }
        });
    },
  },

  // 创建后
  created() {
    // 接受MyInfo页面传过来的值
    this.accounts = this.$route.query.accounts;

    // 查询余额(更新)
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
