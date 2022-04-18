<template>
  <div id="Game">
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
        <el-button type="success" class="beginGame" @click="goCeshi()"
          >测试</el-button
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
        <p>账户:{{ id }}CZT</p>
      </div>
    </div>
  </div>
</template>

<script>
import Web3 from "web3";
// 智能合约生成的ABI参数，调用智能合约里的函数
import { abi } from "../assets/ABI/ABI.json";
// console.log(abi);
// 签署交易的JavaScript库ethereumjs-tx@1.3.7
import Tx from "ethereumjs-tx";
const web3 = new Web3(
  Web3.givenProvider ||
    new Web3.providers.WebsocketProvider("ws://192.168.11.88:8545")
);

// 合约地址
const address = "0xcAF35BA550ADFF051767f61bf8b1C6407CA2d150";
// 通证智能合约的Javascript对象：
const contract = new web3.eth.Contract(abi, address);
// 账户密钥
const pk1 = "私钥"; // 实际项目中应该从process.env.PRIVATE_KEY_1中读取
//密钥转码
const privateKey1 = Buffer.from(pk1, "hex");
export default {
  name: "Game",
  // 模板引入
  components: {},
  // 数据
  data() {
    return {
      msg: "Welcome to Game",
      id: "", //账户
      num1: 0, //自己点数
      num2: 0, //对手点数
      money1: "", //自己押金
      // money2: 10, //对手押金
      balance: 0, //账户余额
      size: "请充值开始游戏", //结果
      judge: "失败", //弹窗提示语
      loading: false, //加载窗
      incident: "", //判断执行什么事件
    };
  },
  // 方法
  methods: {
    // 合约
    contractCall(data, account1) {
      //调用该方法就是为了获取下方nonce
      web3.eth.getTransactionCount(account1, async (err, txCount) => {
        // 构建交易对象async
        const txObject = {
          // nonce:这是账号的前一个交易计数。这个值必须是十六进制
          nonce: web3.utils.toHex(txCount),
          // gasLimit: 消耗Gas上限。部署合约比转账会消耗更多Gas，需要提高上限
          gasLimit: web3.utils.toHex(200000),
          // gasPrice: Gas价格，这里是 5 Gwei。
          gasPrice: web3.utils.toHex(web3.utils.toWei("5", "gwei")),
          // to:此参数将是已部署智能合约的地址
          to: address,
          // data:被调用的智能合约函数的十六进制表示，使用web3.js函数encodeABI()
          data: data,
          // chainId:连接智能合约的主网
          chainId: web3.utils.toHex("84348"),
        };
        // 签署交易
        const tx = new Tx(txObject);
        tx.sign(privateKey1);
        const serializedTx = tx.serialize();
        const raw = "0x" + serializedTx.toString("hex");
        // console.log(raw);
        // 广播交易，将这个已签名的序列化交易发送到测试网络
        // web3.eth.sendSignedTransaction(raw, (err, txHash) => {
        //   console.log("txHash:", err, txHash);
        // });
        // web3.eth.sendTransaction(raw).on("receipt", console.log).on('error', console.error);
        await web3.eth
          .sendSignedTransaction(raw)
          .on("receipt", console.log)
          .then((res) => {
            // 成功回调，获取到成功参数
            // console.log(res, err);
            // 通过订阅事件查询，获取到blockNumber区块号和transactionHash值，通过筛选出对应的值
            // 然后将查询到的结果进行判断，展示
            contract.getPastEvents(
              "AllEvents", // 过滤事件参数，这里获取全部事件
              {
                fromBlock: res.blockNumber, // 起始块
                toBlock: res.blockNumber, // 终止块
              },
              (err, events) => {
                // console.log(events);
                // 遍历筛选
                let arrEvent = events.map((item) => {
                  if (item.transactionHash == res.transactionHash) {
                    // console.log(item);
                    return item;
                  }
                });
                console.log(arrEvent);
                // console.log(arrEvent[0].returnValues);
                // 进行赋值，并判断事件
                let arr = [];
                for (let i in arrEvent[0].returnValues) {
                  arr.push(arrEvent[0].returnValues[i]); //属性
                }

                // 判断进行的事件
                if (this.incident == "betForGame") {
                  // 质押押金事件
                  this.size = "充值了" + arr[1] / 100 + "CZT";
                  this.judge = "充值了" + arr[1] / 100 + "CZT";
                  console.log(this.judge);
                } else if (this.incident == "startGameToContract") {
                  // 清空押金
                  this.money1 = "";
                  // 与合约玩的事件
                  // 赋值并判断大小
                  this.num1 = arr[0];
                  this.num2 = arr[1];
                  if (arr[0] == arr[1]) {
                    this.size = "平局，棋逢对手！";
                    this.judge = "平局，棋逢对手！";
                  } else if (arr[0] > arr[1]) {
                    this.size = "恭喜你赢了" + arr[2] / 100 + "CZT";
                    this.judge = "恭喜你赢了" + arr[2] / 100 + "CZT";
                  } else if (arr[0] < arr[1]) {
                    this.size = "很遗憾你输了" + arr[2] / 100 + "CZT";
                    this.judge = "很遗憾你输了" + arr[2] / 100 + "CZT";
                  }
                } else if (this.incident == "startGameToOtherOne") {
                  // 清空押金
                  this.money1 = "";
                  // 与玩家玩的事件
                  // 赋值并判断大小
                  this.num1 = arr[0];
                  this.num2 = arr[1];
                  if (arr[0] == 0 && arr[1] == 0) {
                    this.judge = "目前没有玩家下注，请等待结果";
                    this.size = "目前没有玩家下注，请等待结果";
                  } else if (arr[0] != 0 && arr[1] != 0) {
                    // this.num1 = arr[0];
                    // this.num2 = arr[1];
                    if (arr[0] > arr[1]) {
                      this.judge = "恭喜你赢了" + arr[2] / 100 + "CZT";
                      this.size = "恭喜你赢了" + arr[2] / 100 + "CZT";
                    } else if (arr[0] == arr[1]) {
                      this.size = "棋逢对手";
                      this.judge = "棋逢对手";
                    } else if (arr[0] < arr[1]) {
                      this.judge = "很遗憾你输了" + arr[2] / 100 + "CZT";
                      this.size = "很遗憾你输了" + arr[2] / 100 + "CZT";
                    }
                  }
                }
                // 弹出提示框,关闭等待
                this.$alert(this.judge, {
                  dangerouslyUseHTMLString: true,
                });
                this.loading = false;
                // 查询余额
                this.checkBalance();
              }
            );
          })
          .catch((err) => {
            //错误回调 上链失败
            console.log("上链失败:", err);
            // 弹出提示框,关闭等待
            this.loading = false;
            this.$alert(this.judge, {
              dangerouslyUseHTMLString: true,
            });
          });
      });
    },
    // 质押押金
    async pledge(money1) {
      this.loading = true;
      // 赋值作为判断上方事件判断
      this.incident = "betForGame";
      // 传递参数到合约
      let data1 = contract.methods.betForGame(money1 * 100).encodeABI();
      await this.contractCall(data1, this.id);
      // 再次使用call方法调用函数，获取返回值
      // 但是返回值未上链不一定正确，可以取到错误回调，进行错误判断
      contract.methods
        .betForGame(money1 * 100)
        .call({ from: this.id })
        .then((e) => {
          console.log(e);
        })
        .catch((e) => {
          // 错误回调
          // console.log(e.message);
          this.judge = JSON.parse(e.message.split("error.")[1]).message;
        });
    },
    //与合约游戏
    async goContract() {
      this.loading = true;
      // 赋值作为判断上方事件判断
      this.incident = "startGameToContract";
      // 传递参数到合约
      let data2 = contract.methods.startGameToContract().encodeABI();
      // function startGameToContract() external returns (uint256,uint256,int256)
      await this.contractCall(data2, this.id);
      //再次使用call回调错误参数
      contract.methods
        .startGameToContract()
        .call({ from: this.id })
        .then((e) => {
          console.log(e);
        })
        .catch((e) => {
          // 错误回调
          // console.log(e);
          this.judge = JSON.parse(e.message.split("error.")[1]).message;
        });
    },
    //与对手游戏
    async goOpponent() {
      // 赋值作为判断上方事件判断
      this.incident = "startGameToOtherOne";
      // 传递参数到合约
      let data3 = contract.methods.startGameToOtherOne().encodeABI();
      //function startGameToOtherOne() external returns (uint256,uint256,int256)
      await this.contractCall(data3, this.id);
      //再次使用call回调错误参数
      contract.methods
        .startGameToOtherOne()
        .call({ from: this.id })
        .then((e) => {
          console.log(e);
        })
        .catch((e) => {
          // 错误回调
          // console.log(e);
          this.judge = JSON.parse(e.message.split("error.")[1]).message;
        });
    },
    // 添加CZT
    goCZT() {
      let data4 = contract.methods.playerMint(10 * 100).encodeABI();
      // function playerMint(uint256 _amount) 这个接口可以获取CZT，一次不超过10000（100）
      this.contractCall(data4, this.id);
      this.judge = "充值成功：10CZT";
      this.loading = true; //loading加载
    },
    // 查询CZT余额
    checkBalance() {
      contract.methods
        .balanceOf(this.id)
        .call({ from: this.id }, (err, result) => {
          // if (err) {
          // console.log(err, "err");
          // }
          console.log("balanceOf", err, result);
          this.balance = result / 100;
        });
    },
    // 测试按钮
    goCeshi() {},
  },
  // 创建后
  created() {
    // console.log(Web3);
    // 获取id值账号并赋值
    this.id = this.$route.query.id;
    // console.log(this.id);
    // 查询czt余额
    this.checkBalance();
  },
  // 挂载后
  mounted() {},
  // 更新后
  updated() {},
};
</script>
<style lang="less" scoped>
#Game {
  width: 100%;
  padding-top: 2rem;
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