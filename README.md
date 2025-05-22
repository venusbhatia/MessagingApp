# Messaging App

A simple CRUD (Create, Read, Update, Delete) messaging application built with React Native and Expo.


<p float="left"> <img src="https://github.com/user-attachments/assets/2f90447e-5e99-4281-b433-c8f292e5ed70" width="200" /> <img src="https://github.com/user-attachments/assets/0701f266-1c25-4577-a32e-06d5d9114b44" width="200" /> <img src="https://github.com/user-attachments/assets/6b72b024-f20d-41eb-ac5d-e8eee7747254" width="200" /> <img src="https://github.com/user-attachments/assets/900d9103-1ff7-4048-bc0f-4d69da591430" width="200" /> <img src="https://github.com/user-attachments/assets/e7b88880-81ba-4eed-a42b-b0ced882eed9" width="200" /> <img src="https://github.com/user-attachments/assets/90b38ffd-51b9-42ce-bf2b-9e5ebd4afa86" width="200" /> </p>

## Features

- View a list of messages
- Create new messages
- View message details
- Edit existing messages
- Delete messages
- Mark messages as read/unread
- Responsive design for both iOS and Android

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MessagingApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Run on iOS**
   - Press `i` in the terminal to open in iOS Simulator
   - Or scan the QR code with your iPhone's camera (Expo Go app required)

5. **Run on Android**
   - Press `a` in the terminal to open in Android Emulator
   - Or scan the QR code with your Android phone (Expo Go app required)

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── context/        # React context for state management
  ├── navigation/     # Navigation configuration
  ├── screens/       # App screens
  ├── types/         # TypeScript type definitions
  └── utils/         # Utility functions
```

## Dependencies

- React Navigation for navigation
- AsyncStorage for local storage
- React Native Vector Icons for icons
- React Native Reanimated for animations

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
