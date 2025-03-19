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

//publish a event
export const publishEvent=async(routingKey, message)=>{
    try {
        if(!channel){
            await connectRabitMq()
        }
        channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)))
        logger.info(`Event Published : ${routingKey}`)
    } catch (e){
        logger.error('Error in RabbitMQ Event Publishing ', e )
    }
}