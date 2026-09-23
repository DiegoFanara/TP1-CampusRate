"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePlaceDto = void 0;
const class_validator_1 = require("class-validator");
const CATEGORIES = ['STUDY_SPACE', 'LIBRARY', 'FOOD_SERVICE', 'SPORTS', 'STUDENT_SERVICE', 'COMPUTER_LAB', 'OTHER'];
const STATUSES = ['ACTIVE', 'TEMPORARILY_CLOSED', 'INACTIVE'];
class CreatePlaceDto {
    name;
    description;
    category;
    address;
    services;
    status;
}
exports.CreatePlaceDto = CreatePlaceDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePlaceDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePlaceDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsIn)(CATEGORIES),
    __metadata("design:type", String)
], CreatePlaceDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePlaceDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePlaceDto.prototype, "services", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(STATUSES),
    __metadata("design:type", String)
], CreatePlaceDto.prototype, "status", void 0);
//# sourceMappingURL=create-place.dto.js.map