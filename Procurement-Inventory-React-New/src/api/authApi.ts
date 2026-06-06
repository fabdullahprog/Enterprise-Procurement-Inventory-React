// src/api/authApi.ts
import api from './axiosInstance';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserResponseDto,
} from '../types';

export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/api/Auth/login', data);
  return response.data;
};

export const registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/api/Auth/register', data);
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await api.post('/api/Auth/logout');
};

export const getCurrentUser = async (): Promise<UserResponseDto> => {
  const response = await api.get<UserResponseDto>('/api/Auth/me');
  return response.data;
};
