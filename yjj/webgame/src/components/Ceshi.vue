<template>
  <div id="Ceshi">
    <h1>{{ msg }}</h1>
    <div class="game_box">
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
            <span>押金：</span>
            <span>{{ money2 }}</span>
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
        <p>账户:{{ id }}</p>
      </div>
    </div>
  </div>
</template>

<script>
// 注意钱包加配置！
// 引入
import Web3 from "web3";
import { abi } from "../assets/ABI/ABI.json";
import Tx from "ethereumjs-tx";

// 合约地址
const address = "0xcAF35BA550ADFF051767f61bf8b1C6407CA2d150";
const web3 = new Web3(
  Web3.givenProvider ||
    new Web3.providers.WebsocketProvider("ws://192.168.11.88:8545")
);
// 通证智能合约的Javascript对象：
const contract = new web3.eth.Contract(abi, address);
// 密钥
const pk1 = "私钥"; // 实际项目中应该从process.env.PRIVATE_KEY_1中读取
const privateKey1 = Buffer.from(pk1, "hex");
export default {
  name: "Ceshi",
  // 模板引入
  components: {},
  // 数据
  data() {
    return {
      msg: "Welcome to Ceshi",
      id: "", //账户
      num1: 0, //自己点数
      num2: 0, //对手点数
      money1: "", //自己押金
      money2: 10, //对手押金
      balance: 0, //账户余额
      size: "请充值开始游戏", //结果
      judge: "失败", //弹窗提示语
    };
  },
  // 方法
  methods: {
    // 合约
    contractCall(data, account1) {
      web3.eth.getTransactionCount(account1, (err, txCount) => {
        // 创建交易对象async
        const txObject = {
          //  nonce:这是账号的前一个交易计数。这个值必须是十六进制
          nonce: web3.utils.toHex(txCount),
          // gasLimit: 消耗Gas上限。部署合约比转账会消耗更多Gas，需要提高上限
          gasLimit: web3.utils.toHex(200000),
          // gasPrice: Gas价格，这里是 10 Gwei。
          gasPrice: web3.utils.toHex(web3.utils.toWei("5", "gwei")),
          // to:此参数将是已部署智能合约的地址
          to: address,
          // data:被调用的智能合约函数的十六进制表示
          data: data,
          // chainId:连接智能合约的主网
          // chainId: web3.utils.toHex("84350"),
          chainId: web3.utils.toHex("84348"),
        };

        // 签署交易
        const tx = new Tx(txObject);
        tx.sign(privateKey1);
        const serializedTx = tx.serialize();
        const raw = "0x" + serializedTx.toString("hex");
        // console.log(raw);
        // 广播交易
        // web3.eth.sendSignedTransaction(raw, (err, txHash) => {
        //   console.log("txHash:", err, txHash);
        // });
        // web3.eth.sendTransaction(raw).on("receipt", console.log, console.log).on('error', console.error);
        web3.eth
          .sendSignedTransaction(raw)
          .then((res, err) => {
            console.log(res, err);
            contract.getPastEvents(
              "AllEvents", // 过滤事件参数，这里获取全部事件
              {
                fromBlock: 0, // 起始块
                toBlock: "latest", // 终止块
              },
              (err, events) => {
                console.log(events);
              }
            );
            //
          })
          .catch((e) => {
            console.log(e);
          });
      });
    },
    // 质押押金  0x02aa1a60fc2f4ac8842a20c4500625596fa15c1e47dd6a8e9754a0572adfb673
    pledge(money1) {
      // console.log(money1);
      // console.log(this.balance);
      let data1 = contract.methods.betForGame(money1 * 100).encodeABI();
      this.contractCall(data1, this.id);
      contract.methods
        .betForGame(money1 * 100)
        .call({ from: this.id })
        .then((e) => {
          console.log(e);
        })
        .catch((err) => {
          console.log(err.message);
        });
    },
    //与合约游戏  0xc02890f0894932bbce73de72be2ffde8ef8a5c3fd3cd042706b0276ea1e1d5aa
    goContract() {
      // 传递参数到合约
      let data2 = contract.methods.startGameToContract().encodeABI();
      // function startGameToContract() external returns (uint256,uint256,int256)
      this.contractCall(data2, this.id);
      // 再次调用单次订阅合约事件
      contract.methods
        .startGameToContract()
        .call({ from: this.id })
        .then((e) => {
          console.log(e);
        })
        .catch((e) => {
          console.log(e);
        });
    },
    //与对手游戏
    goOpponent() {
      let data3 = contract.methods.startGameToOtherOne().encodeABI();
      //function startGameToOtherOne() external returns (uint256,uint256,int256) {
      this.contractCall(data3, this.id);
      contract.methods
        .startGameToOtherOne()
        .call({ from: this.id })
        .then((res, err) => {
          console.log(res);
          console.log(err);
        });
    },
    // 添加CZT
    goCZT() {
      let data4 = contract.methods.playerMint(10 * 100).encodeABI();
      // function playerMint(uint256 _amount) 这个接口可以获取CZT，一次不超过10000（100）
      this.contractCall(data4, this.id);
      this.judge = "充值10CZT";
      this.loading = true; //loading加载
    },
    goCeshi() {
      // 通过地址查询交易详情
      // web3.eth
      //   .getTransactionReceipt(
      //     // transactionHash
      //     "0xc144f01320bca2244c8b2b86c8dfee05308fd0c8075ab83f680b873ff5bc56be"
      //   )
      //   .then((res) => {
      //     // console.log(`Status: ${res.status}`);
      //     console.log(res);
      //   });
      //
      contract.getPastEvents(
        "AllEvents", // 过滤事件参数，这里获取全部事件
        {
          fromBlock: 0, // 起始块
          toBlock: "latest", // 终止块
        },
        (err, events) => {
          console.log(events);
          // console.log(events[0].transactionHash)
          let arr = events;
          arr.forEach((i) => {
            // console.log(i,n,k)
            if (
              i.transactionHash ==
              0xea137ff3407489a6dc63744e6ab4c45ccbfc40a77ce4d8e051306243550023d7
            ) {
              console.log(i);
            }
          });
        } 
      );
    },
  },
  // 创建后
  created() {
    // console.log(Web3);
    // 获取id值账号并赋值
    this.id = this.$route.query.id;
    contract.methods
      .balanceOf(this.id)
      .call({ from: this.id }, (err, result) => {
        if (err) {
          console.log(err, "err");
        }
        console.log("balanceOf", err, result);
        this.balance = result / 100;
      });
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
#Ceshi {
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
