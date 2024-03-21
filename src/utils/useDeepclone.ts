import { CMAClient, DialogAppSDK } from "@contentful/app-sdk"
import { useCallback, useState } from "react"
import DeepClone, { CloneOptions } from "./DeepClone"

const useDeepclone = (sdk: DialogAppSDK, cma: CMAClient, entryId: string) => {

  const [isCloning, setIsCloning] = useState(false)
  const [logs, setLogs] = useState('')
  
  const log = useCallback((str: string) => {
    setLogs((prevState: string) => `${prevState}${str}\n`)
  }, [])

  const clone = useCallback(async (options: CloneOptions) => {
    if (isCloning) {
      throw new Error('already cloning')
    }

    if (!entryId) {
      throw new Error('no entry ID')
    }

    setIsCloning(true)   
    
    const cloner: DeepClone = new DeepClone(sdk, cma, entryId, log, options)    
    await cloner.start()
    
     

      // await findReferences(space, entryId)
      // clearInterval(statusUpdateTimer)

      // console.log(`Found ${referenceCount} reference(s) in total`)

      // console.log(`Creating new entries...`)

      // statusUpdateTimer = setInterval(() => {
      //     console.log(` - created ${newReferenceCount}/${referenceCount} - ${Math.round((newReferenceCount / referenceCount) * 100)}%`)
      // }, STATUS_TIMER)

      // const newReferences = await createNewEntriesFromReferences(space, tag)
      // clearInterval(statusUpdateTimer)

      // console.log(`Created ${newReferenceCount} reference(s)`)

      // console.log(`Updating reference tree...`)

      // statusUpdateTimer = setInterval(() => {
      //     console.log(` - updated ${updatedReferenceCount}/${referenceCount} - ${Math.round((updatedReferenceCount / referenceCount) * 100)}%`)
      // }, STATUS_TIMER)
      // await updateReferenceTree(space, newReferences)
      // clearInterval(statusUpdateTimer)

      // console.log(`Updating done.`)
      // return newReferences[entryId]
      
  }, [isCloning, sdk, cma, log, entryId])


  return {
      isCloning,
      clone,
      logs
  }
}

export default useDeepclone