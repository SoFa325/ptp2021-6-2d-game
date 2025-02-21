import * as geom from "../../Geom";
import { Body } from "./Body";
import { Game } from "../../Game";
import { MimicMap } from "../../Game";
import { Commands } from "./Commands";
import path = require("path/posix");

export class AI {
    private body : Body;
    public Path : geom.Vector[];
    public game : Game; 
    public commands : Commands;

    constructor(game : Game, body : Body) {
        this.game = game;
        this.body = body;
        this.commands = new Commands();
        this.Path = [];
    }

    private go(point : geom.Vector) {
        if (this.body.center.x < point.x) {
            this.commands["MoveRight"] = true;
        }
        else {
            this.commands["MoveRight"] = false;
        }
        if (this.body.center.x > point.x) {
            this.commands["MoveLeft"] = true;
        }
        else {
            this.commands["MoveLeft"] = false;
        }
        if (this.body.center.y < point.y) {
            this.commands["MoveDown"] = true;
        }
        else {
            this.commands["MoveDown"] = false;
        }
        if (this.body.center.y > point.y) {
            this.commands["MoveUp"] = true;
        }
        else {
            this.commands["MoveUp"] = false;
        }
    }

    private getPointCoordinate(place : geom.Vector) : geom.Vector {
        return new geom.Vector(place.x * this.game.tileSize / 2, place.y * this.game.tileSize / 2);
    }

    private chooseMeshPoint(currentPoint : geom.Vector) : geom.Vector {
        let CollisionMesh = Game.grids[this.game.currentGridName].CollisionMesh;
        let Grid = Game.grids[this.game.currentGridName].Grid;
        let posRound = new geom.Vector(
            Math.floor(this.body.center.x / this.game.tileSize), 
            Math.floor(this.body.center.y / this.game.tileSize)
        );
        let place = new geom.Vector(posRound.x * 2 + 1, posRound.y * 2 + 1);
        let answer = new geom.Vector(0, 0);
        for(let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (CollisionMesh[place.x + i][place.y + j] == false &&
                     currentPoint.sub(this.getPointCoordinate(new geom.Vector(answer.x, answer.y))).abs() >
                     currentPoint.sub(this.getPointCoordinate(new geom.Vector(place.x + i, place.y + j))).abs()) {
                         answer = new geom.Vector(place.x + i, place.y + j);
                }
            }
        }
        return answer;
    }

    private makePath(start : geom.Vector, finish : geom.Vector) : geom.Vector[] { 
        let pathMatrix = Game.grids[this.game.currentGridName].PathMatrix;

        console.log(start, finish);
        console.log(pathMatrix.get(JSON.stringify(start)), pathMatrix.get(JSON.stringify(start)).get(JSON.stringify(finish)));

        if (pathMatrix.get(JSON.stringify(start)).get(JSON.stringify(finish)) == undefined) {
            return [];
        }

        if (pathMatrix.get(JSON.stringify(start)).get(JSON.stringify(finish)) == JSON.stringify(finish)) {
            let answer : geom.Vector[];
            answer = [];
            answer[0] = this.getPointCoordinate(start);
            answer[1] = this.getPointCoordinate(finish);
            return answer;
        }
        let middlePoint = JSON.parse(pathMatrix.get(JSON.stringify(start)).get(JSON.stringify(finish)))
        return this.makePath(start, middlePoint).concat(this.makePath(middlePoint, finish));
    }

    public goToPoint(point : geom.Vector) {       
        this.Path = [];
        let startMeshPoint = this.chooseMeshPoint(this.body.center);
        let finishMeshPoint = this.chooseMeshPoint(point);
        this.Path = this.makePath(startMeshPoint, finishMeshPoint);
        if (this.Path != [])
            this.Path[this.Path.length] = point;
    }

    step() {
        if (this.Path.length != 0) {            
            this.go(this.Path[0]);
            if (this.body.center.sub(this.Path[0]).abs() < geom.eps) {
                this.Path.shift();
            }
        }
    }
}