import { CMAClient, DialogAppSDK } from "@contentful/app-sdk"

export type CloneOptions = {
  remove: string
  replace: string
  prefix: string
}

const TIMER = 1000
const THROTTLE = 100

class DeepClone {
  sdk: DialogAppSDK
  cma: CMAClient
  entryId: string
  options: CloneOptions
  log: (str: string) => void
  references: any
  referenceCount: number
  newReferenceCount: number
  updatedReferenceCount: number

  constructor(sdk: DialogAppSDK, cma: CMAClient, entryId: string, log: (str: string) => void, options: CloneOptions) {
    this.sdk = sdk
    this.cma = cma
    this.entryId = entryId
    this.options = options
    this.log = log
    this.references = {}
    this.referenceCount = 0
    this.newReferenceCount = 0
    this.updatedReferenceCount = 0
  }

  async start() {
    this.log(`Starting clone...`)

    // FIND ALL REFERENCES
    this.log(`Finding references recursively...`)
    await this.findReferences(this.entryId)
    this.log(` -- Found ${this.referenceCount} reference(s) in total`)

    // CREATE NEW ENTRIES
    this.log(`Creating new entries...`)
    const newReferences = await this.createNewEntriesFromReferences()
    this.log(` -- Created ${this.newReferenceCount} new entries`)

    this.log(`Updating reference tree...`)
    await this.updateReferenceTree(newReferences)
  
    this.log(`Complete.`)

    return newReferences[this.entryId]
  }
  
  async updateReferencesOnField(field: any, newReferences: any) {
    if (field && Array.isArray(field)) {
      await Promise.all(field.map(async (f) => {
        return await this.updateReferencesOnField(f, newReferences)
      }))
      return
    }
  
    if (field && field.sys && field.sys.type === 'Link' && field.sys.linkType === 'Entry') {
      const oldReference = this.references[field.sys.id]
      const newReference = newReferences[field.sys.id]
      field.sys.id = newReference.sys.id
    }
  }
  
  async updateReferenceTree(newReferences : { [key: string] : any }) {
    for (let entryId in newReferences) {
      const entry = newReferences[entryId]
  
      for (let fieldName in entry.fields) {
        const field = entry.fields[fieldName]
    
        for (let lang in field) {
          const langField = field[lang]
          
          await this.updateReferencesOnField(langField, newReferences)
        }
      }
  
      await this.updateEntry(entry)
      this.updatedReferenceCount++
    }
  }

  async updateEntry (entry: any) {
    await this.wait(THROTTLE)
    await this.cma.entry.update({ entryId: entry.sys.id }, entry)
  }

  generateName(oldName: string) {
    const { remove, replace, prefix } = this.options
    const searchMask = remove || '';
    const regEx = new RegExp(searchMask, 'ig');
    const replaceMask = replace || '';
    const newName = remove ? oldName.replace(regEx, replaceMask) : oldName
    const addLeft = prefix ? `${prefix} ` : ''
    return `${addLeft}${newName}`
  }

  async createNewEntriesFromReferences() {
    const newEntries : { [key: string] : any }= {}

    for (let entryId in this.references) {
      const entry = this.references[entryId]
      console.log(entry)
      if (entry.fields.name && entry.fields.name['en-US']) {
        entry.fields.name['en-US'] = this.generateName(entry.fields.name['en-US'])
      }
      const shouldPublish = entryId !== this.entryId
      const newEntry = await this.createEntry(entry.sys.contentType.sys.id, { fields: entry.fields }, shouldPublish)
      this.newReferenceCount++
      newEntries[entryId] = newEntry
    }

    return newEntries
  }

  async wait(ms: number) {
    return new Promise(resolve => {
      setTimeout(resolve, ms)
    })
  }

  async createEntry(typeId: string, data: any, shouldPublish: boolean) {
    await this.wait(THROTTLE)
    const entry = await this.cma.entry.create({ contentTypeId: typeId }, data)
    if (shouldPublish) {
      await this.cma.entry.publish({entryId: entry.sys.id }, entry)
    }
    return entry
  }

  async getEntry(id: string) {
    const entry = await this.cma.entry.get({ 
      entryId: id
    })
    return entry
  }

  async inspectField(field : any) {
    if (field && Array.isArray(field)) {
      await Promise.all(field.map(async (f) => {
        return await this.inspectField(f)
      }))
      return
    }
    
    if (field && field.sys && field.sys.type === 'Link' && field.sys.linkType === 'Entry') {
      await this.findReferences(field.sys.id)
    }
  }

  async findReferences(id: string) {
    if (this.references[id]) {
      return
    }

    const entry = await this.getEntry(id)
    
    this.referenceCount++
    
    this.references[id] = entry
    
    for (let fieldName in entry.fields) {
      const field = entry.fields[fieldName]
  
      for (let lang in field) {
        const langField = field[lang]
        
        await this.inspectField(langField)
      }
    }
  }
}

export default DeepClone