import { Game } from "./Game";
import * as geom from "./Geom"
import { Control, Keys } from "./Control";
import { Entity } from "./Entities/Entity";

export class Mimic {
    public controlledEntity : Entity = null;
    public infectionRadius = 100;
    public game : Game;

    constructor(game : Game) {
        this.game = game;
    }

    public takeControl(entity : Entity) {
        console.log("biba", entity);
        this.controlledEntity = entity;
    }

    public step() {
        // Подменяем комманды дя Entity, если мы не делаем это каждый ход, команды восстанавливаются сами (см Entity.step)
        this.controlledEntity.commands = Control.commands;

        // Если мышка нажата, мы производим переселение
        if (Control.isMouseClicked()) { 
            // Пересчитываем координаты на экране в игровые координаты (Мб стоит сделать функцию трансформации в game?)
            let coords = new geom.Vector(Control.lastMouseCoordinates().x / this.game.draw.cam.scale,
            Control.lastMouseCoordinates().y / this.game.draw.cam.scale);
            coords = coords.sub(this.game.draw.cam.center.mul(1.0 / this.game.draw.cam.scale));

            // Проверяем соседние entity
            for (let i = 0; i < this.game.entities.length; i++) {

                let target = this.game.entities[i];
                // Расстояние между сущностями
                let centerDistance = this.controlledEntity.body.center.sub(target.body.center).abs();
                // Расстояние от мышки до цели
                let mouseDistance = target.body.center.sub(coords).abs();
                if ((centerDistance < this.infectionRadius) && // Цель в радиусе поражения
                    (mouseDistance < target.body.radius) && // На цель навелись мышкой
                    (this.controlledEntity != target)) { // Нельзя переселяться в себя самого
                    this.takeControl(target);   
                    break;
                }
            }
        }
    }
}