'use strict'
import Devshare from 'devshare'
import AdmZip from 'adm-zip'
import { each } from 'lodash'
import Firepad from 'firepad'
import fs from 'fs'
/**
 * New project page
 */

export function index (req, res) {
  res.json({message: 'Success'})
}

export function zip (req, res) {
  const fileSystem = Devshare
      .project(req.params.owner, req.params.projectName)
      .fileSystem

  fileSystem
    .get()
    .then(directory => {
      // console.log('directory loaded:', directory)
      let zip = new AdmZip()
      let promiseArray = []
      let handleZip = fbChildren => {
        each(fbChildren, child => {
          if (!child.meta || child.meta.entityType === 'folder') {
            delete child.meta
            return handleZip(child)
          }
          console.log('child', child)
          if (child.original && !child.history) return zip.file(child.meta.path, child.original)
          let promise = new Promise(resolve =>
            Firepad.Headless(fileSystem.file(child.meta.path).firebaseRef()).getText(text => {
              console.log('file text', text)
              zip.addFile(child.meta.path, new Buffer(text))
              resolve(text || '')
            })
          )
          promiseArray.push(promise)
        })
      }
      handleZip(directory)
      return Promise.all(promiseArray).then(() => {
        zip.writeZip('./zips/test.zip')
        console.log('promises fulfilled', `${req.params.projectName}-devShare-export.zip`)
				// res.json({ message: 'zip created' })
				res.download('./zips/test.zip')
      })
    })
}
