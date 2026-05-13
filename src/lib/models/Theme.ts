import mongoose, { Schema, Document } from 'mongoose';

export interface ITheme extends Document {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    card: string;
    text: string;
    border: string;
  };
  font: string;
  effects: {
    rain: boolean;
    thunder: boolean;
    sun: boolean;
    particles: boolean;
    leaves: boolean;
    fireflies: boolean;
    clouds: boolean;
  };
  icon: string;
  previewImage: string;
  createdAt: Date;
  updatedAt: Date;
}

const ThemeSchema = new Schema<ITheme>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: false },
    colors: {
      primary: { type: String, default: '#FF8C42' },
      secondary: { type: String, default: '#6BCB77' },
      accent: { type: String, default: '#4FC0D0' },
      background: { type: String, default: '#F5EDDC' },
      card: { type: String, default: '#FFFFFF' },
      text: { type: String, default: '#2C3E2D' },
      border: { type: String, default: '#3D5A3E' },
    },
    font: { type: String, default: 'system-ui' },
    effects: {
      rain: { type: Boolean, default: false },
      thunder: { type: Boolean, default: false },
      sun: { type: Boolean, default: false },
      particles: { type: Boolean, default: false },
      leaves: { type: Boolean, default: false },
      fireflies: { type: Boolean, default: false },
      clouds: { type: Boolean, default: false },
    },
    icon: { type: String, default: '🎨' },
    previewImage: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Theme || mongoose.model<ITheme>('Theme', ThemeSchema);
