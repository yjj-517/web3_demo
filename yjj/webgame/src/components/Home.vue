<template>
  <div id="Home">
    <h1>{{ msg }}</h1>
    <div class="account">
      <h3>用户信息</h3>
      <el-divider></el-divider>
      <p>
        账户：<span>{{ account }}</span>
      </p>
      <el-divider></el-divider>
      <p>
        金额：<span>{{ balance }}ETH</span>
      </p>
      <el-divider></el-divider>
      <p>
        <el-button type="success" class="beginGame" @click="goGame()"
          >前往游戏（密钥交易）</el-button
        >
        <el-button type="success" class="beginGame" @click="goWallet()"
          >前往小狐狸代理交易</el-button
        >
         <el-button type="success" class="beginGame" @click="goQuery()"
          >前往查询交易页面</el-button
        >
        <el-button type="success" class="beginGame" @click="goCeshi()"
          >前往测试</el-button
        >
      </p>
      <el-divider></el-divider>
    </div>
  </div>
</template>

<script>
// 引入
import Web3 from "web3";
export default {
  name: "Home",
  // 模板引入
  components: {},
  // 数据
  data() {
    return {
      msg: "Welcome to Home",
      account: "", //本机账号
      balance: "", //本机余额
    };
  },
  // 方法
  methods: {
    goGame() {
      // console.log(this.account)
      // 路由跳转并传参
      this.$router.push({
        path: "/game",
        query: { id: this.account },
      });
    },
    goCeshi() {
      this.$router.push({
        path: "/ceshi",
        query: { id: this.account },
      });
    },
    goWallet() {
      this.$router.push({
        path: "/wallet",
        query: { id: this.account },
      });
    },
   goQuery() {
      this.$router.push({
        path: "/query",
      });
    },
  },
  // 创建后
  created() {
    // window.ethereum.enable(); // 请求用户授权
    //判断用户是否安装MetaMask钱包插件
    if (typeof window.ethereum === "undefined") {
      //没安装MetaMask钱包进行弹框提示
      this.$alert("请安装MetaMask钱包", {
        dangerouslyUseHTMLString: true,
      });
    } else {
      //如果用户安装了MetaMask，你可以要求他们授权应用登录并获取其账号
      window.ethereum
        .enable()
        .catch(function (reason) {
          //如果用户拒绝了登录请求
          if (reason === "User rejected provider access") {
            // 用户拒绝登录后执行语句；
            this.$alert("请登录MetaMask钱包", {
              dangerouslyUseHTMLString: true,
            });
          } else {
            // 本不该执行到这里，但是真到这里了，说明发生了意外
            console.log("There was a problem signing you in");
          }
        })
        .then(async (accounts) => {
          // 判断是否连接以太或者自定义网络
          if (window.ethereum.networkVersion !== "84348") {
            console.log("请连接xx网络", accounts);
            this.$alert("请连接xx网络", {
              dangerouslyUseHTMLString: true,
            });
          } else {
            // 获取账号和余额
            const web3 = new Web3(window.web3.currentProvider);
            const [acc] = await web3.eth.getAccounts(function () {});
            web3.eth.getBalance(acc, (err, wei) => {
              this.account = acc;
              // 余额单位从wei转换为ether
              this.balance = web3.utils.fromWei(wei, "ether");
              // console.log(acc,this.balance)
            });
          }
        });
    }
  },
  // 挂载后
  mounted() {},
  // 更新后
  updated() {},
};
</script>
<style scoped lang="less">
#Home {
  width: 100%;
  padding-top: 2rem;
}
.account {
  margin: 1.5rem auto;
  width: 30rem;
  border: 0.1rem solid #f7f7f7;
  border-radius: 5%;
  h3,
  p {
    margin: 0 1rem;
    line-height: 3rem;
    input {
      width: 8rem;
      height: 1.3rem;
    }
    .but {
      text-align: center;
      display: inline-block;
      // width: 4rem;
      padding: 0 1rem;
      line-height: 2rem;
      background-color: #909399;
      border-radius: 10%;
      color: #fff;
      text-decoration: none;
    }
    .center {
      background-color: #409eff;
      margin: 0 auto;
      vertical-align: middle;
    }
  }
  :nth-child(1) {
    text-align: center;
  }
}
</style>