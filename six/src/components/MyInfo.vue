<template>
  <div class="info">
    <h1>{{ msg }}</h1>
    <!-- 展示数据框 -->
    <div class="showBox">
      <p>
        账户<span>{{ account }}</span>
      </p>
      <p>
        余额<span style="width: 16rem">{{ balance }}</span
        ><label>单位(ETH)</label>
      </p>
      <div class="showBox_recharge">
        <el-button type="primary" @click="goGame">前往游戏<i class="el-icon-arrow-right el-icon--right"></i></el-button>
      </div>
    </div>
  </div>
</template>

<script>
import Web3 from "web3";
// import { abi } from "../abi/ABI.json";
// import Tx from "ethereumjs-tx";
export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  data() {
    return {
      account: "111", // 账户
      balance: "", // 余额
      recharge: "", // 充值
      accounts: "", // 获取到的当前选中账号
    };
  },
  methods: {
    // 充值
    rechargeETH() {
      console.log(11);
    },
    goGame(){
      this.$router.push({
        path:'/game',
        query:{
          accounts:this.accounts
        }
      });
    },
    // 封装了一个获取MetaMask钱包并有一系列操作的函数
    getMatemask() {
      //判断用户是否安装MetaMask钱包插件
      if (typeof window.ethereum === "undefined") {
        //没安装MetaMask钱包进行弹框提示
        this.$alert("请安装MetaMask", "提示", {
          confirmButtonText: "确定",
        });
      } else {
        //如果用户安装了MetaMask，你可以要求他们授权应用登录并获取其账号
        window.ethereum
          .enable()
          .catch(function (reason) {
            //如果用户拒绝了登录请求
            if (reason === "User rejected provider access") {
              // 用户拒绝登录后执行语句；
            } else {
              // 本不该执行到这里，但是真到这里了，说明发生了意外
              alert("There was a problem signing you in");
            }
          })
          .then((accounts) => {
            // 判断是否连接以太
            if (window.ethereum.networkVersion !== "84348") {
              this.$alert("请连接到对应的以太网", "提示", {
                confirmButtonText: "确定",
              });
            } else {
              let web3 = new Web3(window.web3.currentProvider);
              //如果用户同意了登录请求，你就可以拿到用户的账号

              //这里返回用户钱包地址
              this.accounts = accounts.join();

              // 查询当前选中账户并渲染到对应input中
              this.account = this.accounts;
              // 查看当前账户的余额并渲染到对应input中(这里获取的余额是钱包中的ETH)
              // 读取address中的余额，余额单位是wei
              web3.eth.getBalance(this.accounts, (err, wei) => {
                // 余额单位从wei转换为ether
                this.balance = web3.utils.fromWei(wei, "ether");
              });
            }
          });
      }
    },
  },
  created() {
    // 调用函数
    this.getMatemask();
    
  },
  mounted() {
    // 通过bus把余额传过去
    
    
  },
  updated() {},
  deactivated() {},
};
</script>

<style scoped lang="less">
.info {
  width: 100%;
  height: 100%;
  // 展示数据框
  .showBox {
    margin: auto;
    margin-top: 2rem;
    width: 40rem;
    height: 15rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    border-radius: 0.5rem;
    padding: 5rem;
    box-sizing: border-box;
    display: flex;
    justify-content: space-around;
    flex-direction: column;
    text-align: left;
    p {
      display: flex;
      font-size: 16px;
      margin: 1rem 0;
      align-items: center;
      span {
        margin-left: 1rem;
        background-color: pink;
        width: 21rem;
        display: inline-block;
        height: 2rem;
        line-height: 2rem;
        font-size: 14px;
        color: #fff;
        text-indent: 0.5rem;
        margin-right: 0.3rem;
      }
    }
    .showBox_recharge {
     text-align: right;
    }
  }
}
</style>
