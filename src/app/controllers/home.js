'use strict'
import Devshare from 'devshare'
import Jszip from 'jszip'
import filesave from 'node-safe-filesaver'
import { each } from 'lodash'
import Firepad from 'firepad'
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
      let zip = new Jszip()
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
							zip.file(child.meta.path, text || '')
							resolve(text || '')
            })
          )
          promiseArray.push(promise)
        })
      }
      handleZip(directory)
      return Promise.all(promiseArray).then(() => {
        let content = zip.generate({ type: 'blob' })
				console.log('promises fulfilled', `${req.params.projectname}-devShare-export.zip`)
        let zipFile = filesave.saveAs(content, `${req.params.projectname}-devShare-export.zip`)
        console.log('zip file created', zipFile)
        res.send(zipFile)
      })
    })
}
