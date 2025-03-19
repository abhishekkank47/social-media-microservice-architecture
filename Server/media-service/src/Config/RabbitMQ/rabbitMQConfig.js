import amqp from 'amqplib'
import {logger} from '../../Utils/loggerUtil.js'

const EXCHANGE_NAME= 'facebook_events'
let channel = null

export const connectRabitMq = async()=>{
    try {
        //create connection and channel
        const connection = await amqp.connect(process.env.RABBITMQ_URL)
        channel = await connection.createChannel()
        await channel.assertExchange(EXCHANGE_NAME,'topic',{durable:false})

        logger.info("RABBITMQ IS RUNNING ON SERVER")
        return channel

    } catch (e) {
        logger.error('connection Error in RabbitMQ',e);
    }
} 

//this is for delete the post which has cloudinary url in db and remove media associated to that post in media service which in cloud 

//consume event from post Service a event
export const consumeEvent = async(routingKey, cb)=>{
    try {
        if(!channel){
            await connectRabitMq()
        }
        const q = await channel.assertQueue("",{exclusive:true})

        await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey)
        channel.consume(q.queue, (msg)=>{
            if(msg!==null){
                const content = JSON.parse(msg.content.toString())
                cb(content)
                channel.ack(msg)
            }
        })
        logger.info(`Event Consumed : ${routingKey}`)
    } catch (e){
        logger.error('Error in RabbitMQ Event Consuming ', e )
    }
}