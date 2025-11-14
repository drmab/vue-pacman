import type { BaseMap } from './Map'
import type { Stage } from './Stage'
import type { Coord, GlobalEnv, Vector } from '~/util/Interfaces'

export class Item {
  _params: any
  _id: number = 0
  _stage!: Stage
  x: number = 0 // Position coordinate: abscissa
  y: number = 0 // Position coordinate: ordinate
  width: number = 20 // width
  height: number = 20 // height
  type: number = 0 // Object type, 0 means normal object (not bound to the map), 1 means player control object, 2 means program control object
  color: string = '#F00' // Logo color
  status: number = 1 // Object status, 0 means inactive/finished, 1 means normal, 2 means paused, 3 means temporary, 4 means abnormal
  orientation: number = 0 // Current positioning direction, 0 means right, 1 means down, 2 means left, 3 means up
  speed: number = 0 // Moving speed
  // map related
  location!: BaseMap // Location map, Map object
  coord!: Coord // If the object is bound to the map, set the map coordinates; if not, set the location coordinates
  vector!: Vector // target coordinates
  path!: Vector[] // NPC auto-walking path
  // layout related
  frames: number = 1 // Speed level, how many frames change in internal calculator times
  times: number = 0 // Refresh canvas count (for loop animation state judgment)
  timeout: number = 0 // Countdown (for process animation state judgment)
  control: any = {} // Control the cache and process it when the anchor point is reached
  constructor(params: {} = {}) {
    this._params = params
    Object.assign(this, this._params)
  }

  update: (globalObj: GlobalEnv) => void = () => { } // Update parameter information
  draw: (context: any, globalObj: GlobalEnv) => void = () => { } // draw
}

export class LogoItem extends Item {
  constructor(options: {}) {
    super(options)
    this.draw = (context: any) => {
      const t = Math.abs(5 - this.times % 10)
      context.fillStyle = '#FFE600'
      context.beginPath()
      context.arc(this.x, this.y, this.width / 2, t * 0.04 * Math.PI, (2 - t * 0.04) * Math.PI, false)
      context.lineTo(this.x, this.y)
      context.closePath()
      context.fill()
      context.fillStyle = '#000'
      context.beginPath()
      context.arc(this.x + 5, this.y - 27, 7, 0, 2 * Math.PI, false)
      context.closePath()
      context.fill()
    }
  }
}

export class NameItem extends Item {
  constructor(options: {}) {
    super(options)
    this.draw = (context: any, _globalObj: GlobalEnv) => {
      context.font = 'bold 42px Helvetica'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillStyle = '#FFF'
      context.fillText('Pac Man', this.x, this.y)
    }
  }
}

export class ScoreLevelItem extends Item {
  constructor(options: {}) {
    super(options)
    this.draw = (context: any, globalObj: GlobalEnv) => {
      context.font = 'bold 26px Helvetica'
      context.textAlign = 'left'
      context.textBaseline = 'bottom'
      context.fillStyle = '#C33'
      context.fillText('SCORE', this.x, this.y)
      context.font = '26px Helvetica'
      context.textAlign = 'left'
      context.textBaseline = 'top'
      context.fillStyle = '#FFF'
      context.fillText(globalObj.SCORE.toString(), this.x + 12, this.y)
      context.font = 'bold 26px Helvetica'
      context.textAlign = 'left'
      context.textBaseline = 'bottom'
      context.fillStyle = '#C33'
      context.fillText('LEVEL', this.x, this.y + 72)
      context.font = '26px Helvetica'
      context.textAlign = 'left'
      context.textBaseline = 'top'
      context.fillStyle = '#FFF'
      context.fillText((this._stage.index).toString(), this.x + 12, this.y + 72)
    }
  }
}

export class StatusItem extends Item {
  constructor(options: {}) {
    super(options)
    this.draw = (context: any, _globalObj: GlobalEnv) => {
      if (this._stage.status === 2 && this.times % 2) {
        context.font = '24px Helvetica'
        context.textAlign = 'left'
        context.textBaseline = 'center'
        context.fillStyle = '#FFF'
        context.fillText('PAUSE', this.x, this.y)
      }
    }
  }
}

export class LifeItem extends Item {
  constructor(options: {}) {
    super(options)
    this.draw = (context: any, globalObj: GlobalEnv) => {
      for (let i = 0; i < globalObj.LIFE; i++) {
        const shiftX = this.x + 40 * i
        context.fillStyle = '#FFE600'
        context.beginPath()
        context.arc(shiftX, this.y, this.width / 2, 0.15 * Math.PI, -0.15 * Math.PI, false)
        context.lineTo(shiftX, this.y)
        context.closePath()
        context.fill()
      }
      context.font = '26px Helvetica'
      context.textAlign = 'left'
      context.textBaseline = 'bottom'
      context.fillStyle = '#FFF'
      context.fillText(`X ${globalObj.LIFE}`, this.x - 15, this.y + 56)
    }
  }
}

export class PlayerItem extends Item {
  constructor(options: {}) {
    super(options)
    this.draw = (context: any, _globalObj: GlobalEnv) => {
      context.fillStyle = '#FFE600'
      context.beginPath()
      if (this._stage.status !== 3) {
        if (this.times % 2) {
          context.arc(this.x, this.y, this.width / 2, (0.5 * this.orientation + 0.20) * Math.PI, (0.5 * this.orientation - 0.20) * Math.PI, false)
        }
        else {
          context.arc(this.x, this.y, this.width / 2, (0.5 * this.orientation + 0.01) * Math.PI, (0.5 * this.orientation - 0.01) * Math.PI, false)
        }
      }
      else if (this._stage.timeout) {
        context.arc(
          this.x,
          this.y,
          this.width / 2,
          (0.5 * this.orientation + 1 - 0.02 * this._stage.timeout) * Math.PI,
          (0.5 * this.orientation - 1 + 0.02 * this._stage.timeout) * Math.PI,
          false,
        )
      }
      context.lineTo(this.x, this.y)
      context.closePath()
      context.fill()
    }
    this.update = (globalObj: GlobalEnv) => {
      if (!this.coord.offset) {
        if (this.control.orientation !== 'undefined') {
          if (!this._stage.BaseMap.get(this.coord.x + globalObj.COS[this.control.orientation], this.coord.y + globalObj.SIN[this.control.orientation])) {
            this.orientation = this.control.orientation
          }
        }
        this.control = {}
        const value = this._stage.BaseMap.get(this.coord.x + globalObj.COS[this.orientation], this.coord.y + globalObj.SIN[this.orientation])
        if (value === 0) {
          this.x += this.speed * globalObj.COS[this.orientation]
          this.y += this.speed * globalObj.SIN[this.orientation]
        }
        else if (value < 0) {
          this.x -= this._stage.BaseMap.size * (this._stage.BaseMap.xLength - 1) * globalObj.COS[this.orientation]
          this.y -= this._stage.BaseMap.size * (this._stage.BaseMap.yLength - 1) * globalObj.SIN[this.orientation]
        }
      }
      else {
        if (!this._stage.BeanMap.get(this.coord.x, this.coord.y)) {
          // eat pacman
          globalObj.SCORE++
          this._stage.BeanMap.set(this.coord.x, this.coord.y, 1)
          // eat energy beans
          if (this._stage.CONFIG.goods.includes(`${this.coord.x},${this.coord.y}`)) {
            this._stage.NPCs.forEach((item: Item) => {
              if (item.status === 1) {
                // If the NPC is in a normal state, set it to a temporary state
                item.timeout = 450
                item.status = 3
              }
            })
          }
        }
        this.x += this.speed * globalObj.COS[this.orientation]
        this.y += this.speed * globalObj.SIN[this.orientation]
      }
    }
  }
}

export class NpcItem extends Item {
  constructor(options: {}) {
    super(options)
    this.draw = (context: any, globalObj: GlobalEnv) => {
      let isSick = false
      if (this.status === 3) {
        isSick = !!(this.timeout > 80 || this.times % 2)
      }
      if (this.status !== 4) {
        // Draw Body -> SVG logo 
        context.fillStyle = isSick ? '#BABABA' : this.color
        /*
        blink: 223.576,13.413 > 14,579,0
        blinkc: 222.482,15.112,222.721,13.971
        start: 226.535,42
        startc: 229.824,39.827,227.47,41.95
        move: 208.977,17.839
        min: 208.977,13.413
        */
        let blink = [this.x + 4.579, this.y, this.x+3.485, this.y+1.699, this.x+3.724, this.y+0.558]
        let start = [this.x+7.558, this.y+29.052, this.x+10.865, this.y+26.414, this.x+8.493, this.y+28.537]
        let move = [this.x-10, this.y + 4.326]
        let path1 = new Path2D(`M${start[0]},${start[1]-18}h-18.202c-0.791,0-1.491-0.508-1.736-1.262c-0.241-0.751,0.021-1.574,0.658-2.043 l5.589-4.069c1.162-0.846,2.899-0.056,2.899,1.475c0,0.566-0.258,1.119-0.748,1.479c0,0-0.73,0.532-1.056,0.767 c3.766,0,6.44,0,10.109,0c-5.347-4.101-16.183-12.421-16.183-12.421c-0.405-0.315-0.715-0.788-0.715-1.517 c0-0.938,0.851-1.758,1.745-1.758h20.479c0.981,0,1.791,0.836,1.791,1.823c0,0.656-0.339,1.13-0.671,1.407l-5.362,4.463 c-0.776,0.647-1.925,0.54-2.574-0.237c-0.284-0.337-0.421-0.753-0.421-1.162c0-0.526,0.225-1.045,0.657-1.407 c0,0,0.892-0.742,1.484-1.234c-3.707,0-6.063,0-9.926,0c4.842,3.716,14.368,10.974,16.095,12.301 C${start[2]},${start[3]-18},${start[4]},${start[5]-18},${start[0]},${start[1]-18} M${move[0]},${move[1]-18}h20.362c1.009,0,1.826,0.816,1.826,1.829 c0,1.007-0.817,1.821-1.826,1.821h-20.362c-1.009,0-1.826-0.814-1.826-1.821C207.151,18.655,${move[0]},${move[1]-18}z`);
        context.fill(path1);
        if(this.times % 2 == 1) {
            let path2 = new Path2D(`M${blink[0]},${blink[1]-18}l3.12-2.049c0.851-0.557,1.995-0.321,2.552,0.533c0.559,0.847,0.322,1.99-0.53,2.55 l-3.122,2.044c-0.85,0.561-1.992,0.322-2.551-0.528C${blink[2]},${blink[3]-18},${blink[4]},${blink[5]-18},${blink[0]},${blink[1]-18}`);
            context.fill(path2);
        }
      }
      context.fillStyle = '#FFF'
      if (isSick) {
        // Draw Eyeball
        context.beginPath()
        context.arc(this.x - this.width * 0.15, this.y - this.height * 0.21, this.width * 0.08, 0, 2 * Math.PI, false)
        context.arc(this.x + this.width * 0.15, this.y - this.height * 0.21, this.width * 0.08, 0, 2 * Math.PI, false)
        context.fill()
        context.closePath()
      }
      else {
        // Draw Eyeball
        context.beginPath()
        context.arc(this.x - this.width * 0.15, this.y - this.height * 0.21, this.width * 0.12, 0, 2 * Math.PI, false)
        context.arc(this.x + this.width * 0.15, this.y - this.height * 0.21, this.width * 0.12, 0, 2 * Math.PI, false)
        context.fill()
        context.closePath()
        // Draw Pupil
        context.fillStyle = '#000'
        context.beginPath()
        context.arc(
          this.x - this.width * (0.15 - 0.04 * globalObj.COS[this.orientation]),
          this.y - this.height * (0.21 - 0.04 * globalObj.SIN[this.orientation]),
          this.width * 0.07,
          0,
          2 * Math.PI,
          false,
        )
        context.arc(
          this.x + this.width * (0.15 + 0.04 * globalObj.COS[this.orientation]),
          this.y - this.height * (0.21 - 0.04 * globalObj.SIN[this.orientation]),
          this.width * 0.07,
          0,
          2 * Math.PI,
          false,
        )
        context.fill()
        context.closePath()
      }
    }
    this.update = (globalObj: GlobalEnv) => {
      let newMap: any = null
      if (this.status === 3 && !this.timeout) {
        this.status = 1
      }
      // Calculated when reaching the coordinate center
      if (!this.coord.offset) {
        if (this.status === 1) {
          // timer
          if (!this.timeout) {
            newMap = JSON.parse(JSON.stringify(this._stage.BaseMap.data).replace(/2/g, '0'))
            this._stage.NPCs.forEach((item: Item) => {
              // NPC treats all other NPCs in normal state as a wall
              if (item._id !== this._id && item.status === 1) {
                newMap[item.coord.y][item.coord.x] = 1
              }
            })
            this.path = this._stage.BaseMap.finder({
              map: newMap,
              start: this.coord,
              end: this._stage.PLAYER.coord,
            })
            if (this.path.length) {
              this.vector = this.path[0]
            }
          }
        }
        else if (this.status === 3) {
          newMap = JSON.parse(JSON.stringify(this._stage.BaseMap.data).replace(/2/g, '0'))
          this._stage.NPCs.forEach((item: Item) => {
            if (item._id !== this._id) {
              newMap[item.coord.y][item.coord.x] = 1
            }
          })
          this.path = this._stage.BaseMap.finder({
            map: newMap,
            start: this._stage.PLAYER.coord,
            end: this.coord,
            type: 'next',
          })
          if (this.path.length) {
            this.vector = this.path[Math.floor(Math.random() * this.path.length)]
          }
        }
        else if (this.status === 4) {
          newMap = JSON.parse(JSON.stringify(this._stage.BaseMap.data).replace(/2/g, '0'))
          this.path = this._stage.BaseMap.finder({
            map: newMap,
            start: this.coord,
            end: this._params.coord,
          })
          if (this.path.length) {
            this.vector = this.path[0]
          }
          else {
            this.status = 1
          }
        }
        // whether to change direction
        if (this.vector.change) {
          this.coord.x = this.vector.x
          this.coord.y = this.vector.y
          const pos = this._stage.BaseMap.coord2position(this.coord.x, this.coord.y)
          this.x = pos.x
          this.y = pos.y
        }
        // direction determination
        if (this.vector.x > this.coord.x) {
          this.orientation = 0
        }
        else if (this.vector.x < this.coord.x) {
          this.orientation = 2
        }
        else if (this.vector.y > this.coord.y) {
          this.orientation = 1
        }
        else if (this.vector.y < this.coord.y) {
          this.orientation = 3
        }
      }
      this.x += this.speed * globalObj.COS[this.orientation]
      this.y += this.speed * globalObj.SIN[this.orientation]
    }
  }
}

export class OverItem extends Item {
  constructor(options: {}) {
    super(options)
    this.draw = (context: any, globalObj: GlobalEnv) => {
      context.fillStyle = '#FFF'
      context.font = 'bold 48px Helvetica'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(globalObj.LIFE ? 'YOU WIN!' : 'GAME OVER', this.x, this.y)
    }
  }
}

export class FinalScoreItem extends Item {
  constructor(options: {}) {
    super(options)
    this.draw = (context: any, globalObj: GlobalEnv) => {
      context.fillStyle = '#FFF'
      context.font = '20px Helvetica'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(`FINAL SCORE: ${globalObj.SCORE + 50 * Math.max(globalObj.LIFE - 1, 0)}`, this.x, this.y)
    }
  }
}
