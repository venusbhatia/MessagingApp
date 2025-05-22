# Messaging App

A simple CRUD (Create, Read, Update, Delete) messaging application built with React Native and Expo.

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
