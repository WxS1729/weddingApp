// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const MAX_LIMIT = 100
const db = cloud.database()
const surveys = db.collection('surveys')

// 云函数入口函数
exports.main = async (event, context) => {
    const { OPENID } = cloud.getWXContext()

    // 查询当前用户是否为管理员
    const { data: currentUser } = await surveys.where({
        _openid: OPENID
    }).get()
    const isAdmin = currentUser.length && currentUser[0].isAdmin === true

    if (!isAdmin) {
        return { isAdmin: false, list: [], total: 0 }
    }

    // 查询所有记录
    const { total } = await surveys.count()
    const batchTimes = Math.ceil(total / MAX_LIMIT)
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
        tasks.push(surveys.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get())
    }

    const list = (await Promise.all(tasks)).reduce((acc, cur) => {
        return acc.concat(cur.data.map(({ name, num }) => ({ name, num: num || 0 })))
    }, [])

    return { isAdmin: true, list, total }
}
