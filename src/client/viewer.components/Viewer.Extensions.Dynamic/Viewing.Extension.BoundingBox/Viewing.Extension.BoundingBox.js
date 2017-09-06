/////////////////////////////////////////////////////////////////
// BoundingBox Viewer Extension
// By Philippe Leefsma, Autodesk Inc, August 2017
//
/////////////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import Toolkit from 'Viewer.Toolkit'
import ReactDOM from 'react-dom'
import React from 'react'

class BoundingBoxExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onContextMenu = this.onContextMenu.bind(this)

    this.linesMaterial = this.createMaterial(0x0000FF)

    this.lineGroups = []
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createMaterial (color = 0x000000, opacity = 1.0) {

    return new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      depthWrite: false,
      depthTest: true,
      linewidth: 10,
      opacity
    })
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.viewer.loadDynamicExtension(
      'Viewing.Extension.ContextMenu').then(
      (ctxMenuExtension) => {
        ctxMenuExtension.addHandler(
          this.onContextMenu)
      })

    console.log('Viewing.Extension.BoundingBox loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'bounding-box'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId () {

    return 'Viewing.Extension.BoundingBox'
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.BoundingBox unloaded')

    super.unload ()

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelRootLoaded () {

    this.options.loader.show (false)

    this.viewer.impl.createOverlayScene (
      'boundingBox',
      this.linesMaterial)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onSelection (event) {

    if (event.selections.length) {

      const selection = event.selections[0]

      const model =
        this.viewer.activeModel ||
        this.viewer.model

      this.selectedDbId = selection.dbIdArray[0]

      const bbox =
        await Toolkit.getWorldBoundingBox(
          model, this.selectedDbId)

      this.drawBox(bbox)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  drawBox (bbox) {

    const geometry = new THREE.Geometry()

    const { min, max } = bbox

    geometry.vertices.push(new THREE.Vector3(min.x, min.y, min.z))
    geometry.vertices.push(new THREE.Vector3(max.x, min.y, min.z))

    geometry.vertices.push(new THREE.Vector3(max.x, min.y, min.z))
    geometry.vertices.push(new THREE.Vector3(max.x, min.y, max.z))

    geometry.vertices.push(new THREE.Vector3(max.x, min.y, max.z))
    geometry.vertices.push(new THREE.Vector3(min.x, min.y, max.z))

    geometry.vertices.push(new THREE.Vector3(min.x, min.y, max.z))
    geometry.vertices.push(new THREE.Vector3(min.x, min.y, min.z))

    geometry.vertices.push(new THREE.Vector3(min.x, max.y, max.z))
    geometry.vertices.push(new THREE.Vector3(max.x, max.y, max.z))

    geometry.vertices.push(new THREE.Vector3(max.x, max.y, max.z))
    geometry.vertices.push(new THREE.Vector3(max.x, max.y, min.z))

    geometry.vertices.push(new THREE.Vector3(max.x, max.y, min.z))
    geometry.vertices.push(new THREE.Vector3(min.x, max.y, min.z))

    geometry.vertices.push(new THREE.Vector3(min.x, max.y, min.z))
    geometry.vertices.push(new THREE.Vector3(min.x, max.y, max.z))

    geometry.vertices.push(new THREE.Vector3(min.x, min.y, min.z))
    geometry.vertices.push(new THREE.Vector3(min.x, max.y, min.z))

    geometry.vertices.push(new THREE.Vector3(max.x, min.y, min.z))
    geometry.vertices.push(new THREE.Vector3(max.x, max.y, min.z))

    geometry.vertices.push(new THREE.Vector3(max.x, min.y, max.z))
    geometry.vertices.push(new THREE.Vector3(max.x, max.y, max.z))

    geometry.vertices.push(new THREE.Vector3(min.x, min.y, max.z))
    geometry.vertices.push(new THREE.Vector3(min.x, max.y, max.z))

    const lines = new THREE.Line(geometry,
      this.linesMaterial,
      THREE.LinePieces)

    this.lineGroups.push(lines)

    this.viewer.impl.addOverlay('boundingBox', lines)

    this.viewer.impl.invalidate(
      true, true, true)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onContextMenu (event) {

    const model =
      this.viewer.activeModel ||
      this.viewer.model

    event.menu.forEach((entry) => {

      const title = entry.title.toLowerCase()

      switch (title) {

        case 'isolate':
          entry.target = () => {
            Toolkit.isolateFull(
              this.viewer, this.selectedDbId, model)
          }
          break

        case 'hide selected':
          entry.target = () => {
            Toolkit.hide(
              this.viewer, this.selectedDbId, model)
          }
          break

        case 'show all objects':
          entry.target = () => {
            Toolkit.isolateFull(
              this.viewer, [], model)
            this.viewer.fitToView()
          }
          break

        default: break
      }
    })

    const instanceTree = model.getData().instanceTree

    const dbId = event.dbId || (instanceTree
        ? instanceTree.getRootId()
        : -1)

    if (dbId > -1) {

      event.menu.push({
        title: 'Clear All BoundingBoxes',
        target: () => {
          this.lineGroups.forEach((lines) => {

            this.viewer.impl.removeOverlay('boundingBox', lines)
          })

          this.viewer.impl.invalidate(
            true, true, true)

          this.lineGroups = []
        }
      })
    }
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension (
  BoundingBoxExtension.ExtensionId,
  BoundingBoxExtension)

export default 'Viewing.Extension.BoundingBox'

