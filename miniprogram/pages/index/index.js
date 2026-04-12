const {
    genLocation
} = require('../../common/utils')

// 管理员openid列表，可以在云开发管理页找到，是管理员的话可以看到公告栏页面入口，也可以通过云函数greetings的返回值openid来查看，还可以在本文件getGreetings方法里通过打印openid变量来查看
const MANAGER = ['']

const APP = getApp()
const isRemoved = APP.globalData.isRemoved

Page({
    data: {
        ...APP.globalData,
        isManager: false, // 当前用户是否为管理员
        musicIsPaused: false, // 是否暂停背景音乐
        exchangeOpacity1: 1,
        exchangeOpacity2: 0,
        activeIdx: isRemoved ? 0 : -1, // 祝福语轮播用，当前显示的祝福语索引值
        form: { // 表单信息
            name: '',
            num: '',
            greeting: ''
        },
        weddingTimeStr: [], // 格式化的婚礼日期列表
        countdown: {
            d0: '0', d1: '0', h0: '0', h1: '0', m0: '0', m1: '0', s0: '0', s1: '0',
            d0f: false, d1f: false, h0f: false, h1f: false, m0f: false, m1f: false, s0f: false, s1f: false
        },

        // 云存储图片（需要动态获取HTTPS链接）
        cloudImages: {
            top: '',
            topBackground: '',
            vinyl: '',
            music: '',
        },

        // 以上变量都不用动，以下变量是需要手动修改的

        // 是否显示彩蛋（由于彩蛋我没有改动，显示的还是我本人的内容，所以我把它默认隐藏起来，方便别人抄作业）
        showEggs: false,

        // 祝福语列表
        greetings: isRemoved ? [
            // 云开发下架后显示的祝福语数据，可以在云开发环境销毁前把数据库的数据导出来并贴到这里
            {
                name: '新郎 & 新娘',
                num: 2,
                greeting: '欢迎大家来见证我们的幸福时刻，我们婚礼上见哦~'
            }, {
                name: '伴郎 & 伴娘',
                num: 2,
                greeting: '祝帅气的新郎和美丽的新娘新婚快乐~白头偕老💐'
            }
        ] : [],

        // 背景音乐（默认用陈奕迅的《I DO》，想换的话自己去找音频资源，我是在「婚贝」上找的）
        music: {
            src: 'cloud://cloud1-6gcoidmn8681ebe1.636c-cloud1-6gcoidmn8681ebe1-1405350599/audio/bgm.mp3', // 音频资源链接
            name: '海鸥', // 歌名
            singer: '逃跑计划' // 歌手名
        },

        // 酒店信息（通过页面上的「选择位置并获取定位信息」按钮可以获取定位信息，发布前记得把按钮注释起来）
        location: genLocation([{
            name: '莱喜莉·琉光之境',
            address: '详细地址:济南市天桥区',
            latitude: 36.6804031066657,
            longitude: 116.99127764550778
        }])[0],

        // 图片信息（其实就是婚纱照了）
        imgs: {
            // 封面图
            cover: 'https://res.wx.qq.com/t/fed_upload/459fb8da-b31a-420f-b8cc-f51126952685/cover.jpg',

            // 音乐封面
            poster: 'https://res.wx.qq.com/t/fed_upload/d811d254-e5d6-4c19-9ff8-77c4b6128137/poster.jpg',

            // 新郎独照
            husband: 'https://res.wx.qq.com/t/fed_upload/d811d254-e5d6-4c19-9ff8-77c4b6128137/husband.jpg',

            // 新娘独照
            wife: 'https://res.wx.qq.com/t/fed_upload/d811d254-e5d6-4c19-9ff8-77c4b6128137/wife.jpg',

            // 轮播图1
            swiper1: [
                'https://res.wx.qq.com/t/fed_upload/849dfcf2-049a-42ba-9f6c-ddd6f30b8487/swiper1-1.jpg',
                'https://res.wx.qq.com/t/fed_upload/849dfcf2-049a-42ba-9f6c-ddd6f30b8487/swiper1-2.jpg',
                'https://res.wx.qq.com/t/fed_upload/849dfcf2-049a-42ba-9f6c-ddd6f30b8487/swiper1-3.jpg'
            ],

            // 连续图
            series: [
                'https://res.wx.qq.com/t/fed_upload/c707cb28-126b-4a5d-89f6-688551456d15/series1.jpg',
                'https://res.wx.qq.com/t/fed_upload/c707cb28-126b-4a5d-89f6-688551456d15/series2.jpg',
                'https://res.wx.qq.com/t/fed_upload/c707cb28-126b-4a5d-89f6-688551456d15/series3.jpg'
            ],

            // 左上图
            leftUp: 'https://res.wx.qq.com/t/fed_upload/50898c02-4dd4-480a-ba6c-b175461b7b31/left-up.jpg',

            // 左下图
            leftDown: 'https://res.wx.qq.com/t/fed_upload/50898c02-4dd4-480a-ba6c-b175461b7b31/left-down.jpg',

            // 四宫图
            map: [
                'https://res.wx.qq.com/t/fed_upload/b959a506-ca42-47e1-9fbd-732a6151e3d9/map1.jpg',
                'https://res.wx.qq.com/t/fed_upload/b959a506-ca42-47e1-9fbd-732a6151e3d9/map2.jpg',
                'https://res.wx.qq.com/t/fed_upload/b959a506-ca42-47e1-9fbd-732a6151e3d9/map3.jpg',
                'https://res.wx.qq.com/t/fed_upload/b959a506-ca42-47e1-9fbd-732a6151e3d9/map4.jpg'
            ],

            // 轮播图2
            swiper2: [
                'https://res.wx.qq.com/t/fed_upload/65134c0f-c513-410e-b4ff-ab738801540f/swiper2-1.jpg',
                'https://res.wx.qq.com/t/fed_upload/65134c0f-c513-410e-b4ff-ab738801540f/swiper2-2.jpg',
                'https://res.wx.qq.com/t/fed_upload/65134c0f-c513-410e-b4ff-ab738801540f/swiper2-3.jpg'
            ],

            // 轮播图2下方常驻图
            swiper2Static: 'https://res.wx.qq.com/t/fed_upload/30d86ea7-84b8-46ce-ae60-e31b83a04fcc/swiper2-static.jpg',

            // 轮播图3
            swiper3: [
                'https://res.wx.qq.com/t/fed_upload/77b990f0-6f16-4fa2-8163-ad0eac3e40da/swiper3-1.jpg',
                'https://res.wx.qq.com/t/fed_upload/77b990f0-6f16-4fa2-8163-ad0eac3e40da/swiper3-2.jpg',
                'https://res.wx.qq.com/t/fed_upload/77b990f0-6f16-4fa2-8163-ad0eac3e40da/swiper3-3.jpg'
            ],

            // 结尾图1
            end1: 'https://res.wx.qq.com/t/fed_upload/9b5bad9c-216b-4fd5-a3da-01bdb3a5e832/end1.jpg',

            // 结尾图2
            end2: 'https://res.wx.qq.com/t/fed_upload/9b5bad9c-216b-4fd5-a3da-01bdb3a5e832/end2.jpg'
        }
    },

    // 监听页面滚动，控制交换图片的不透明度
    onPageScroll(e) {
        if (!this._exchangeTop) return
        const rectTop = this._exchangeTop - e.scrollTop
        const h = this._exchangeHeight || 275

        let o1, o2
        if (rectTop >= -320) {
            o1 = 1; o2 = 0
        } else if (rectTop <= -320 - h) {
            o1 = 0; o2 = 1
        } else {
            const progress = (-320 - rectTop) / h
            o1 = 1 - progress
            o2 = progress
        }

        this.setData({ exchangeOpacity1: o1, exchangeOpacity2: o2 })
    },

    // 小程序加载时，拉取表单信息并填充，以及格式化各种婚礼时间
    onLoad() {
        this.timer = null
        this.music = null
        this.isSubmit = false

        // 获取云存储图片的HTTPS链接
        this.loadCloudImages()

        if (!isRemoved) {
            const db = wx.cloud.database()
            db.collection('surveys').get({
                success: res => {
                    if (res.data.length) {
                        const {
                            name,
                            num,
                            greeting
                        } = res.data[0]
                        this.setData({
                            form: {
                                name,
                                num,
                                greeting
                            }
                        })
                    }
                }
            })
        }

        this.lunisolarDate = this.selectComponent('#calendar').lunisolarDate
        this.setData({
            weddingTimeStr: [
                this.lunisolarDate.format('YYYY-MM-DD HH:mm'),
                this.lunisolarDate.getSeason(),
                this.lunisolarDate.format('YYYY年MM月DD号  HH:mm'),
                this.lunisolarDate.format('农历lMlD  dddd'),
                this.lunisolarDate.format('YYYY年MM月DD号')
            ]
        })

        // 启动婚礼倒计时
        this.startCountdown()
    },

    // 婚礼倒计时
    startCountdown() {
        const updateCountdown = () => {
            const target = new Date('2026-05-24T12:00:00').getTime()
            const now = Date.now()
            const diff = target - now

            if (diff <= 0) {
                this.setData({ countdown: { d0:'0',d1:'0',h0:'0',h1:'0',m0:'0',m1:'0',s0:'0',s1:'0', d0f:false,d1f:false,h0f:false,h1f:false,m0f:false,m1f:false,s0f:false,s1f:false } })
                if (this.countdownTimer) {
                    clearInterval(this.countdownTimer)
                    this.countdownTimer = null
                }
                return
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            const nd = String(days).padStart(2, '0')
            const nh = String(hours).padStart(2, '0')
            const nm = String(minutes).padStart(2, '0')
            const ns = String(seconds).padStart(2, '0')

            const old = this.data.countdown
            const d0f = old.d0 !== nd[0]
            const d1f = old.d1 !== nd[1]
            const h0f = old.h0 !== nh[0]
            const h1f = old.h1 !== nh[1]
            const m0f = old.m0 !== nm[0]
            const m1f = old.m1 !== nm[1]
            const s0f = old.s0 !== ns[0]
            const s1f = old.s1 !== ns[1]

            this.setData({
                countdown: { d0:nd[0],d1:nd[1],h0:nh[0],h1:nh[1],m0:nm[0],m1:nm[1],s0:ns[0],s1:ns[1], d0f,d1f,h0f,h1f,m0f,m1f,s0f,s1f }
            })

            const anyFlip = d0f||d1f||h0f||h1f||m0f||m1f||s0f||s1f
            if (anyFlip) {
                setTimeout(() => {
                    this.setData({
                        'countdown.d0f': false, 'countdown.d1f': false,
                        'countdown.h0f': false, 'countdown.h1f': false,
                        'countdown.m0f': false, 'countdown.m1f': false,
                        'countdown.s0f': false, 'countdown.s1f': false
                    })
                }, 400)
            }
        }

        updateCountdown()
        this.countdownTimer = setInterval(updateCountdown, 1000)
    },

    // 小程序卸载时，取消自动拉取祝福语定时器，销毁背景音乐
    onUnload() {
        if (this.timer !== null) {
            clearInterval(this.timer)
            this.timer = null
        }

        if (this.countdownTimer !== null) {
            clearInterval(this.countdownTimer)
            this.countdownTimer = null
        }

        if (this.music !== null) {
            this.music.destroy()
            this.music = null
        }
    },

    // 小程序可见时，拉取祝福语，并设置定时器每20s重新拉取一次祝福语
    onShow() {
        if (!isRemoved) {
            this.getGreetings()

            this.timer === null && (this.timer = setInterval(() => this.getGreetings(), 20000));
        }

        // 恢复倒计时
        if (!this.countdownTimer) {
            this.startCountdown()
        }
    },

    // 小程序不可见时，取消自动拉取祝福语定时器
    onHide() {
        if (this.timer !== null) {
            clearInterval(this.timer)
            this.timer = null
        }

        if (this.countdownTimer !== null) {
            clearInterval(this.countdownTimer)
            this.countdownTimer = null
        }
    },

    // 小程序可用时，初始化背景音乐并自动播放
    onReady() {
        // 缓存 exchange-wrap 的初始位置
        const query = wx.createSelectorQuery().in(this)
        query.select('.exchange-wrap').boundingClientRect()
        query.exec(res => {
            if (res[0]) {
                this._exchangeTop = res[0].top
                this._exchangeHeight = res[0].height
            }
        })
        if (this.music === null) {
            this.music = wx.createInnerAudioContext({
                useWebAudioImplement: false
            })
            this.music.src = this.data.music.src
            this.music.loop = true
            this.music.autoplay = true
        }
    },

    // 分享到会话
    onShareAppMessage() {
        return {
            title: '好久不见，婚礼见٩(๑^o^๑)۶',
            imageUrl: '../../images/shareAppMsg.jpg'
        }
    },

    // 分享到朋友圈
    onShareTimeline() {
        return {
            title: '好久不见，婚礼见٩(๑^o^๑)۶',
            imageUrl: '../../images/shareTimeline.jpg'
        }
    },

    // 点击右上角音乐按钮控制音频播放和暂停
    toggleMusic() {
        if (this.music.paused) {
            this.music.play()
            this.setData({
                musicIsPaused: false
            })
        } else {
            this.music.pause()
            this.setData({
                musicIsPaused: true
            })
        }
    },

    // 打开酒店定位
    /**
 * 打开地图查看指定位置
 * @param {Object} location - 位置信息对象
 * @param {number} location.latitude - 纬度坐标
 * @param {number} location.longitude - 经度坐标 
 * @param {string} location.name - 位置名称
 * @param {string} location.address - 详细地址
 */
openLocation() {
        const {
            latitude,
            longitude,
            name,
            address
        } = this.data.location
        wx.openLocation({
            latitude,
            longitude,
            name,
            address
        })
    },
    // 呼叫
call(e) {
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.phone
        })
    },

    // 提交表单
    submit(e) {
        if (!this.isSubmit) {
            const {
                name,
                num
            } = e.detail.value
            if (name === '') {
                wx.showToast({
                    title: '要写上名字哦~',
                    icon: 'error'
                })
            } else if (num === '') {
                wx.showToast({
                    title: '要写上人数哦~',
                    icon: 'error'
                })
            } else if (!/^[1-9]\d*$/.test(num)) {
                wx.showToast({
                    title: '人数不对哦~',
                    icon: 'error'
                })
            } else {
                if (isRemoved) {
                    wx.showToast({
                        title: '婚礼结束了哦~'
                    })
                } else {
                    this.isSubmit = true
                    const wording = this.data.form.name ? '更新' : '提交';
                    wx.showLoading({
                        title: `${wording}中`
                    })
                    wx.cloud.callFunction({
                        name: 'surveys',
                        data: e.detail.value
                    }).then(({
                        result: {
                            name,
                            num,
                            greeting,
                            _id
                        }
                    }) => {
                        const greetings = this.data.greetings
                        !greetings.some(item => {
                            if (item._id === _id) { // 如果找到了该祝福语，更新之
                                item.greeting = greeting
                                return true
                            }
                            return false
                        }) && greetings.push({ // 如果没有找到，追加之
                            name,
                            greeting,
                            _id
                        })
                        this.setData({
                            form: {
                                name,
                                num,
                                greeting
                            },
                            greetings
                        })
                        this.isSubmit = false
                        wx.showToast({
                            title: `${wording}成功`,
                            icon: 'success'
                        })
                    })
                }
            }
        }
    },

    // 获取祝福语
    getGreetings() {
        wx.cloud.callFunction({
            name: 'greetings'
        }).then(({
            result: {
                greetings,
                openid
            }
        }) => {
            const isManager = MANAGER.indexOf(openid) > -1
            greetings.length && this.setData(this.data.activeIdx === -1 ? {
                isManager,
                greetings,
                activeIdx: 0
            } : {
                isManager,
                greetings
            })
        })
    },

    // 轮播动画结束时切换到下一个
    onAnimationend() {
        this.setData({
            activeIdx: (this.data.activeIdx === this.data.greetings.length - 1) ? 0 : (this.data.activeIdx + 1)
        })
    },

    // 跳转到联系新郎新娘板块
    goPhone() {
        wx.pageScrollTo({
            selector: '.step-wrap',
            offsetTop: 400
        })
    },

    // 跳转到写表单板块
    goWrite() {
        wx.pageScrollTo({
            selector: '.form',
            offsetTop: -200
        })
    },

    // 跳转到公告栏页面
    goInfo() {
        wx.navigateTo({
            url: '../info/index'
        })
    },

    // 获取云存储图片的HTTPS链接
    loadCloudImages() {
        wx.cloud.getTempFileURL({
            fileList: [
                'cloud://cloud1-6gcoidmn8681ebe1.636c-cloud1-6gcoidmn8681ebe1-1405350599/images/top.png',
                'cloud://cloud1-6gcoidmn8681ebe1.636c-cloud1-6gcoidmn8681ebe1-1405350599/images/top_background.png',
                'cloud://cloud1-6gcoidmn8681ebe1.636c-cloud1-6gcoidmn8681ebe1-1405350599/images/vinyl.png',
                'cloud://cloud1-6gcoidmn8681ebe1.636c-cloud1-6gcoidmn8681ebe1-1405350599/images/music.png',
                'cloud://cloud1-6gcoidmn8681ebe1.636c-cloud1-6gcoidmn8681ebe1-1405350599/images/step.jpg',
                'cloud://cloud1-6gcoidmn8681ebe1.636c-cloud1-6gcoidmn8681ebe1-1405350599/images/yjjx1.png',
                'cloud://cloud1-6gcoidmn8681ebe1.636c-cloud1-6gcoidmn8681ebe1-1405350599/images/yjjx2.png',
                'cloud://cloud1-6gcoidmn8681ebe1.636c-cloud1-6gcoidmn8681ebe1-1405350599/images/yellowAndPurple.png',
                'cloud://cloud1-6gcoidmn8681ebe1.636c-cloud1-6gcoidmn8681ebe1-1405350599/images/blackBackground2.png',
                'cloud://cloud1-6gcoidmn8681ebe1.636c-cloud1-6gcoidmn8681ebe1-1405350599/images/fuqiang.png',
                'cloud://cloud1-6gcoidmn8681ebe1.636c-cloud1-6gcoidmn8681ebe1-1405350599/images/tel_man.png',
                'cloud://cloud1-6gcoidmn8681ebe1.636c-cloud1-6gcoidmn8681ebe1-1405350599/images/tel_girl.png',
                'cloud://cloud1-6gcoidmn8681ebe1.636c-cloud1-6gcoidmn8681ebe1-1405350599/images/exchange1.jpg',
                'cloud://cloud1-6gcoidmn8681ebe1.636c-cloud1-6gcoidmn8681ebe1-1405350599/images/exchange2.jpg',
                'cloud://cloud1-6gcoidmn8681ebe1.636c-cloud1-6gcoidmn8681ebe1-1405350599/images/blackBackground3.png',
                'cloud://cloud1-6gcoidmn8681ebe1.636c-cloud1-6gcoidmn8681ebe1-1405350599/images/countdown.png',
                'cloud://cloud1-6gcoidmn8681ebe1.636c-cloud1-6gcoidmn8681ebe1-1405350599/images/formBackground.png',
                'cloud://cloud1-6gcoidmn8681ebe1.636c-cloud1-6gcoidmn8681ebe1-1405350599/images/end1.png',
                'cloud://cloud1-6gcoidmn8681ebe1.636c-cloud1-6gcoidmn8681ebe1-1405350599/images/end2.png',
                'cloud://cloud1-6gcoidmn8681ebe1.636c-cloud1-6gcoidmn8681ebe1-1405350599/images/end3.png'
            ],
            success: res => {
                const fileList = res.fileList
                const cloudImages = {
                    top: fileList[0].tempFileURL,
                    topBackground: fileList[1].tempFileURL,
                    vinyl: fileList[2].tempFileURL,
                    music: fileList[3].tempFileURL,
                    step: fileList[4].tempFileURL,
                    yjjx1: fileList[5].tempFileURL,
                    yjjx2: fileList[6].tempFileURL,
                    yellowAndPurple: fileList[7].tempFileURL,
                    blackBackground2: fileList[8].tempFileURL,
                    fuqiang: fileList[9].tempFileURL,
                    telMan: fileList[10].tempFileURL,
                    telGirl: fileList[11].tempFileURL,
                    exchange1: fileList[12].tempFileURL,
                    exchange2: fileList[13].tempFileURL,
                    blackBackground3: fileList[14].tempFileURL,
                    countdown: fileList[15].tempFileURL,
                    formBackground: fileList[16].tempFileURL,
                    end1: fileList[17].tempFileURL,
                    end2: fileList[18].tempFileURL,
                    end3: fileList[19].tempFileURL,
                }
                this.setData({ cloudImages })
            },
            fail: err => {
                console.error('获取云存储图片失败', err)
            }
        })
    }
})