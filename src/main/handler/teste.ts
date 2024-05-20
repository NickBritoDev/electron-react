import { ipcMain } from 'electron'
import * as fs from 'fs'
import * as XLSX from 'xlsx'
import nodemailer from 'nodemailer'

ipcMain.handle('read-file', async (_event, filePath) => {
  try {
    const fileBuffer = await fs.promises.readFile(filePath)
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 })
    return json
  } catch (error) {
    console.error('Failed to read file:', error)
    throw error
  }
})

ipcMain.handle('send-emails', async (_event, data) => {
  const { emails, subject, message } = data

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'gmvb_desenv@grupomaisvalor.com.br',
      pass: 'THE>aSe7WnN*8eR='
    }
  })

  const emailPromises = emails.map((email: string) => {
    const mailOptions = {
      from: 'gmvb_desenv@grupomaisvalor.com.br',
      to: email,
      subject: subject,
      text: message
    }

    return transporter
      .sendMail(mailOptions)
      .then((info) => {
        console.log(`Email sent to ${email}: ${info.response}`)
      })
      .catch((error) => {
        console.error(`Failed to send email to ${email}:`, error)
      })
  })

  try {
    await Promise.all(emailPromises)
    return { success: true }
  } catch (error) {
    console.error('Failed to send emails:', error)
    throw error
  }
})
