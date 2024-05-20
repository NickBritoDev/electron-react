import React, { useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Spinner,
  Text
} from '@chakra-ui/react'
import { IoCloudUploadOutline } from 'react-icons/io5'
import { FaRegCheckCircle } from 'react-icons/fa'

const App: React.FC = () => {
  const [fileContent, setFileContent] = useState<null[][]>([])
  const [filePath, setFilePath] = useState<string>('')
  const [hideButton, setHideButton] = useState(false)
  const [inputKey, setInputKey] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (file) {
      const filePath = file.path
      setFilePath(filePath)
    }
  }

  const readFile = async (): Promise<void> => {
    try {
      const content = await window.electron.ipcRenderer.invoke('read-file', filePath)
      setFileContent(content)
      setHideButton(true)
    } catch (error) {
      console.error('Failed to read file:', error)
    }
  }

  const resetFile = (): void => {
    setFilePath('')
    setFileContent([])
    setHideButton(false)
    setInputKey((prevKey) => prevKey + 1)
  }

  const sendEmails = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const emailPromises = fileContent.slice(1).map(async (row) => {
        const email = row[1]
        const subject = `Assunto do Email: ${row[2]}`
        const message = `Estamos enviando esse email para ${row[0]} para saber se ainda tem interesse no produto ${row[2]}`
        return window.electron.ipcRenderer.invoke('send-emails', {
          emails: [email],
          subject,
          message
        })
      })

      await Promise.all(emailPromises)
      alert('Emails enviados com sucesso!')
    } catch (error) {
      console.error('Failed to send emails:', error)
      alert('Falha ao enviar emails.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Flex flexDir={'column'} alignItems={'center'} justifyContent={'center'} pt={20} gap={10}>
      <Box pos={'relative'} boxShadow={'xl'} rounded={'xl'}>
        <Box pos={'absolute'} left={'30%'} top={'25%'}>
          {filePath ? (
            <FaRegCheckCircle size={100} color="green" />
          ) : (
            <IoCloudUploadOutline size={100} color="green" />
          )}
        </Box>
        <Input
          key={inputKey}
          opacity={0}
          type="file"
          border={'none'}
          w={'250px'}
          h={'250px'}
          onChange={handleFileChange}
        />
      </Box>
      {!hideButton && <Button onClick={readFile}>Ler arquivo</Button>}
      {hideButton && (
        <>
          <Button onClick={resetFile}>Resetar</Button>
          <Button onClick={sendEmails} isDisabled={isLoading}>
            Enviar Emails
          </Button>
        </>
      )}
      {isLoading ? (
        <Flex alignItems="center" justifyContent="center" flexDirection="column">
          <Spinner size="xl" />
          <Text mt={4}>Enviando emails, por favor, aguarde...</Text>
        </Flex>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>{fileContent[0]?.map((cell, index) => <Th key={index}>{cell}</Th>)}</Tr>
          </Thead>
          <Tbody>
            {fileContent.slice(1).map((row, rowIndex) => (
              <Tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <Td key={cellIndex}>{cell}</Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Flex>
  )
}

export default App
