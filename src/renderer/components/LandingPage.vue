<template>
  <div id="wrapper">
    <Layout>
      <Content :style="{margin: '20px', background: '#fff', minHeight: '100%'}">
        <ul class="btn-ul">
          <li>
            <i-button class="alt" :loading="btnloading" @click="openDialog">选择文件夹</i-button>
            <span class="desc">选择了{{fileNum}}个文件</span>
          </li>
          <li>
            <i-button class="alt" :loading="btnloading" @click="openSaveDialog">保存路径</i-button>
            <span class="desc">
              <a href="#" @click="openFilePath">{{savePath}}</a>
            </span>
          </li>
          <li>
            <i-button class="alt" type="primary"
                      :loading="btnloading"
                      :disabled="!btnEnable" @click="producePsd">生成</i-button>
<!--            <span class="desc">{{finishCount}}</span>-->
          </li>
          <!--<li>-->
            <!--<i-button class="alt" disabled type="error" @click="terminate">停止</i-button>-->
            <!--<span></span>-->
          <!--</li>-->
        </ul>
        <Divider />
        <Progress :percent="progress" status="active" />
        <Divider />
        <div class="main-content">
          <ul class="file-ul">
            <li class="file-name-li" v-for="(item, index) in filePaths" :key="index">
              <span>{{item}}</span>
              <Icon v-show="finishPath.includes(item)" style="color: green" type="ios-checkmark" size="14"/>
            </li>
          </ul>
        </div>
      </Content>
    </Layout>
  </div>
</template>

<script>
  import {generatePng2} from '../psd';
  const path = require('path');
  export default {
    name: 'landing-page',
    data () {
      return {
        filePaths: [],
        savePath: localStorage.getItem('savePath') || '',
        finishCount: 0,
        finishPath: [],
        btnloading: false
      };
    },
    methods: {
      openDialog () {
        this.filePaths = [];
        this.finishPath = [];
        this.finishCount = 0;
        this.$electron.ipcRenderer.send('open-directory-dialog', {
          properties: ['openFile', 'multiSelections'],
          filters: [{
            name: 'Images',
            extensions: ['*.psd']
          }]
        });
        this.$electron.ipcRenderer.once('selectItems', (event, path) => {
          this.filePaths = path;
        });
      },
      producePsd () {
        this.finishPath = [];
        this.finishCount = 0;
        let tasks = [];
        this.$Spin.show();
        this.btnloading = true;
        this.filePaths.map(item => {
          let arr = item.split('/');
          let fileName = arr[arr.length - 1].split('.')[0];
          let t = generatePng2(item).then(psd => {
            this.finishCount += 1;
            this.finishPath.push(item);
            return psd.image.saveAsPng(path.join(this.savePath, `${fileName}.png`));
          }).then(() => {
          });
          tasks.push(t);
        });

        Promise.all(tasks).then(() => {
          this.$Spin.hide();
          this.btnloading = false;
        });
      },
      openSaveDialog () {
        this.$electron.ipcRenderer.send('open-directory-dialog', {
          properties: ['openDirectory']
        });
        this.$electron.ipcRenderer.once('selectItems', (event, path) => {
          this.savePath = path[0];
          localStorage.setItem('savePath', this.savePath);
        });
      },
      terminate () {
        //
      },
      openFilePath () {
        this.$electron.ipcRenderer.send('open-file', this.savePath);
      }
    },
    created () {
      this.$electron.ipcRenderer.removeAllListeners('selectItems');
      this.$electron.ipcRenderer.removeAllListeners('finish');
    },
    mounted () {
      this.filePaths = [];
    },
    computed: {
      fileNum () {
        return this.filePaths.length;
      },
      btnEnable () {
        return this.filePaths.length > 0 && this.savePath;
      },
      progress () {
        return this.filePaths.length === 0 ? 0 : +(this.finishCount / this.filePaths.length * 100).toFixed(0);
      }
    }
  };
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    padding: 20px 20px;
    width: 100vw;
  }

  #logo {
    height: auto;
    margin-bottom: 20px;
    width: 420px;
  }

  main {
    display: flex;
    justify-content: space-between;
  }

  main > div { flex-basis: 50%; }

  .left-side {
    display: flex;
    flex-direction: column;
  }

  .welcome {
    color: #555;
    font-size: 23px;
    margin-bottom: 10px;
  }

  .title {
    color: #2c3e50;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 6px;
  }

  .title.alt {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .doc p {
    color: black;
    margin-bottom: 10px;
  }

  .doc button {
    font-size: .8em;
    cursor: pointer;
    outline: none;
    padding: 0.75em 2em;
    border-radius: 2em;
    display: inline-block;
    color: #fff;
    background-color: #4fc08d;
    transition: all 0.15s ease;
    box-sizing: border-box;
    border: 1px solid #4fc08d;
  }

  .doc button.alt {
    color: #42b983;
    background-color: transparent;
  }

  .btn-ul {
    width: 100%;
    list-style: none;
  }
  .btn-ul li{
    margin: 5px;
    display: flex;
  }
  .btn-ul li .desc{
    margin-left: 20px;
    line-height: 32px;
  }
  .main-content {
    width: 100%;
    height: 250px;
    overflow-y: auto;
  }
  .file-ul {
    width: 100%;
  }
  .file-ul .file-name-li {
    display: flex;
    justify-content: space-between;
  }
</style>
