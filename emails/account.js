const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'developer@neerajbhat.in',
        subject: 'Thanks for joining in!',
        text: `Welcome to the Task Manager App, ${name}. Let us know how you get along with the app.`
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'developer@neerajbhat.in',
        subject: 'Sorry to see you go!',
        text: `Goodbye, ${name}. I hope to see you back soon.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}