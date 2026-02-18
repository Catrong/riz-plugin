<div align="center">

[![Guild](https://img.shields.io/badge/频道-Hutao114Pgr939-9cf?style=flat-square&logo=GroupMe)](https://pd.qq.com/s/e3z86q6bw)
[![Guild](https://img.shields.io/badge/频道-RkBwFBaRqa-9cf?style=flat-square&logo=Discord)](https://discord.gg/invite/RkBwFBaRqa)
[![Bilibili](https://img.shields.io/badge/Bilibili-就是不会告诉你-A4CAFA?style=flat-square&logo=bilibili&logoColor=white&labelColor=ff69b4)](https://space.bilibili.com/403342249)
[![Stars](https://img.shields.io/github/stars/Catrong/riz-plugin?style=flat-square&color=yellow&label=Star)](../../stargazers)

![version](https://img.shields.io/badge/插件版本-0.1.0-9cf?style=flat-square)
![version](https://img.shields.io/badge/Rizline-2.1.1-9cf?style=flat-square)
![version](https://img.shields.io/badge/PhigrosVer-115-9cf?style=flat-square)
</div>

### 介绍

`riz-plugin` 为查询Rizline信息的插件，目前仅支持曲目图鉴功能，有相关的建议和问题可以在[Issues](../../issues)中提出，欢迎[PR](../../pulls)。

具体功能可在安装插件后 通过 `/rizhelp` 查看详细指令

---

### 安装：

在Yunzai目录下运行

> 使用Github

```
#安装插件本体
git clone --depth=1 https://github.com/Catrong/riz-plugin.git ./plugins/riz-plugin/ 
#进入插件目录
cd ./plugins/riz-plugin/ 
#安装插件所需依赖
pnpm install -P
```

> 使用Gitee

```
#安装插件本体
git clone --depth=1 https://gitee.com/catrong/riz-plugin.git ./plugins/riz-plugin/
#进入插件目录
cd ./plugins/riz-plugin/
#安装插件所需依赖
pnpm install -P 
```

> [!WARNING]
> 请使用主人权限执行该指令以下载曲绘，否则相关曲绘将无法正常展示！（可以是标准输入或者其他平台）
> 
>```
> /riz downill
>```

> [!TIP]
> 如果安装依赖时速度过慢，运行：
> 
>```
> pnpm config set registry https://registry.npmmirror.com
>```

---

#### Todo

* [ ] 别名
* [ ] 帮助菜单
* [ ] 查分

---

### 功能

以下#均可用/代替，命令头可自定义

#### **以下为用户功能**

| **功能名称** | **功能说明**
| :- | :-
| `#riz (song\|曲) xxx` | 查询 rizline 中某一曲目的图鉴
| `#riz (table\|定数表) <定数>\+?` | 查询 rizline 定数表，14 = (14.0, 14.5)，14+ = (14.6, 14.9)

#### **以下为管理功能**

| 功能名称 | 功能说明
| :- | :-
| `#riz (强制\|qz)?(更新\|gx)` | 更新本插件
| `#riz (下载曲绘\|down ill)` | 下载曲绘到本地


### 支持我的创作

[<img src="https://github.com/user-attachments/assets/8c181f08-a2b6-4e67-8b61-bd2e4027a6a4" width="400" />](https://afdian.com/a/Feijiang_)  

感谢您的支持，您的支持就是我创作的最大动力！

---

### 贡献者

感谢以下贡献者对本项目做出的贡献

<a href="https://github.com/Catrong/riz-plugin/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Catrong/riz-plugin" />
</a>

![Alt](https://repobeats.axiom.co/api/embed/3ba1307fae8ac160167cbb2556334fe324ce3065.svg "Repobeats analytics image")

### Star History

<a href="https://www.star-history.com/#Catrong/riz-plugin&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Catrong/riz-plugin&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Catrong/riz-plugin&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Catrong/riz-plugin&type=Date" />
 </picture>
</a>


---

### 免责声明

1. 功能仅限内部交流与小范围使用，请勿将`Yunzai-Bot`及`riz-plugin`用于任何以盈利为目的的场景.
2. 图片与其他素材均来自于网络，仅供交流学习使用，如有侵权请联系，会立即删除.

###### 写的不好，轻喷……

### 友情链接

<table>
    <tr>
        <td align="center" valign="top" nowrap="nowrap"> <a href="https://github.com/yhArcadia/Yunzai-Bot-plugins-index"><b>Yunzai-Bot 相关内容索引</b></a></td>
        <td align="center" valign="top" nowrap="nowrap"> <a href="https://github.com/yoimiya-kokomi/Yunzai-Bot"><b>Yunzai-Bot</b></a></td>
        <td align="center" valign="top" nowrap="nowrap"> <a href="https://github.com/yoimiya-kokomi/Miao-Yunzai"><b>Miao-Yunzai</b></a></td>
        <td align="center" valign="top" nowrap="nowrap"> <a href="https://github.com/TimeRainStarSky/Yunzai"><b>TRSS-Yunzai</b></a></td>
        <td align="center" valign="top" nowrap="nowrap"> <a href="https://github.com/Catrong/phi-plugin"><b>phi-plugin</b></a></td>
    </tr>
</table>
