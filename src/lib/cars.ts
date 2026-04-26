import carsData from "../../data/cars.json";
import { Car } from "@/types/car";

const cars: Car[] = carsData as Car[];

export function getAllCars(): Car[] {
  return cars;
}

export function getCarById(id: number): Car | undefined {
  return cars.find((car) => car.id === id);
}

export function getCarsByIds(ids: number[]): Car[] {
  return ids
    .map((id) => getCarById(id))
    .filter((car): car is Car => car !== undefined);
}

export function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }
  return `₹${(price / 100000).toFixed(1)} L`;
}

export function getUniqueBrands(): string[] {
  return [...new Set(cars.map((c) => c.brand))];
}

export function getUniqueBodyTypes(): string[] {
  return [...new Set(cars.map((c) => c.body_type))];
}

export function getUniqueFuelTypes(): string[] {
  return [...new Set(cars.map((c) => c.fuel_type))];
}
