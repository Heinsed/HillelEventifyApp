import { View, TextInput, Button, StyleSheet, Keyboard, TouchableWithoutFeedback } from "react-native";
import auth from '@react-native-firebase/auth';
import firestore from "@react-native-firebase/firestore";
import { useState, useCallback } from "react";
import CustomPressable from "../../../components/CustomPressable";
import styled from "styled-components/native";
import UIStyles from "../../../styles/UI";
import { SafeAreaView } from "react-native-safe-area-context";
import TextField from '../../../components/FormInput';
import mainStore from "../../../stores/MainStore";
const { themeStore } = mainStore;
const currentTheme = themeStore.theme;

const Login = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [confirmation, setConfirmation] = useState(null);
    const [code, setCode] = useState("");
    const [isFocused, setFocused] = useState(false);
    const [errorLogin, setErrorLogin] = useState('');

    const sendOTP = useCallback(async () => {
        setErrorLogin('');
        if (phoneNumber !== '' && phoneNumber.length === 23) {
            try {
                const phone = phoneNumber.replace(/[\s()-]/g, '');
                console.log(phone);
                const usersSnapshot = await firestore().collection("users").doc(phone).get();
                if (!usersSnapshot.exists) {
                    setErrorLogin('Такого користувача не знайдено.');
                    return;
                }
                const confirmation = await auth().signInWithPhoneNumber(phone);
                setConfirmation(confirmation);
                console.log("OTP sent successfully!");
            } catch (error) {
                console.error("Error sending OTP:", error);
                setErrorLogin('Помилка. Спробуйте ще раз');
            }
        } else {
            setErrorLogin('Невірний номер телефону');
        }
    }, [phoneNumber]);

    const confirmCode = useCallback(async () => {
        try {
            await confirmation.confirm(code);
            console.log("User is signed in successfully!");
        } catch (error) {
            console.error("Error confirming code:", error);
            setErrorLogin('Невірний код підтвердження');
        }
    }, [code, confirmation]);

    const handlePhoneNumberChange = useCallback((masked, unmasked) => {
        setPhoneNumber(masked);
        setErrorLogin('');
    }, []);

    const handleCodeChange = useCallback((masked, unmasked) => {
        setCode(masked);
        setErrorLogin('');
    }, []);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <LoginScreen>
                <LoginForm>
                    {confirmation ? (
                        <>
                            <WrapperTitleCode>
                                Верифікація
                            </WrapperTitleCode>
                            <WrapperContent>
                                Будь ласка, пройдіть авторизацію щоб продовжити користуватись додатком.
                            </WrapperContent>
                            <FieldContainer>
                                <CodeInput
                                    value={code}
                                    aria-valuemin={6}
                                    aria-valuemax={6}
                                    autoFocus={true}
                                    onChangeText={handleCodeChange}
                                    mask={[/\d/, /\d/, /\d/, /\d/, /\d/, /\d/]}
                                    placeholderFillCharacter='-'
                                />
                                <WrapperError>{errorLogin}</WrapperError>
                            </FieldContainer>
                            <ButtonsContainer>
                                <ButtonDefault targetFunction={confirmCode}>
                                    <ButtonDefaultText>Підтвердити</ButtonDefaultText>
                                </ButtonDefault>
                            </ButtonsContainer>
                        </>
                    ) : (
                        <>
                            <WrapperLogo>
                                Eventify
                            </WrapperLogo>
                            <WrapperTitle>
                                Вас вітає додаток <TextColor>Eventify</TextColor>! Будь ласка, увійдіть у свій акаунт
                            </WrapperTitle>
                            <FieldContainer>
                                <TextField
                                    value={phoneNumber}
                                    placeholder="Номер телефону"
                                    keyboardType="phone-pad"
                                    placeholderTextColor={currentTheme === 'dark' ? UIStyles.light.lightGrey : UIStyles.light.lightGrey}
                                    aria-valuemin={11}
                                    aria-valuemax={11}
                                    onChangeText={handlePhoneNumberChange}
                                    mask={['+', /\d/, /\d/, ' (', /\d/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, ' - ', /\d/, /\d/, ' - ', /\d/, /\d/]}
                                    placeholderFillCharacter='_'
                                />
                                <WrapperError>{errorLogin}</WrapperError>
                            </FieldContainer>
                            <ButtonLink targetFunction={() => navigation.navigate("Registration")}>
                                <ButtonLinkText>В мене немає акаунта</ButtonLinkText>
                            </ButtonLink>
                            <ButtonsContainer>
                                <ButtonDefault targetFunction={sendOTP}>
                                    <ButtonDefaultText>Продовжити</ButtonDefaultText>
                                </ButtonDefault>
                            </ButtonsContainer>
                        </>
                    )}
                </LoginForm>
            </LoginScreen>
        </TouchableWithoutFeedback>
    );
};

const LoginScreen = styled(SafeAreaView)({
    flex: 1,
    background: currentTheme === 'dark' ? UIStyles.dark.white : UIStyles.light.white,
});

const LoginForm = styled.View({
    paddingTop: 35,
    marginLeft: 24,
    marginRight: 24,
    height: '100%'
});

const WrapperTitle = styled.Text({
    fontFamily: 'MontserratBold',
    fontSize: 24,
    color: currentTheme === 'dark' ? UIStyles.dark.black : UIStyles.light.black,
});

const WrapperTitleCode = styled.Text({
    fontFamily: 'MontserratBold',
    fontSize: 24,
    color: currentTheme === 'dark' ? UIStyles.dark.black : UIStyles.light.black,
    textAlign: 'center'
});

const WrapperLogo = styled.Text({
    fontFamily: 'MontserratBold',
    fontSize: 48,
    color: currentTheme === 'dark' ? UIStyles.dark.green : UIStyles.light.green,
    marginBottom: 50,
});

const TextColor = styled.Text({
    color: currentTheme === 'dark' ? UIStyles.dark.green : UIStyles.light.green,
});

const WrapperContent = styled.Text({
    textAlign: 'center',
    fontFamily: 'MontserratRegular',
    fontSize: 12,
    marginTop: 15,
    color: currentTheme === 'dark' ? UIStyles.dark.dark : UIStyles.light.dark,
});

const WrapperError = styled.Text({
    textAlign: 'center',
    fontFamily: 'MontserratRegular',
    fontSize: 12,
    marginTop: 15,
    color: currentTheme === 'dark' ? UIStyles.dark.dark : UIStyles.light.dark,
});

const CodeInput = styled(TextField)(({ isFocused }) => ({
    padding: 16,
    marginTop: 20,
    letterSpacing: 10,
    borderBottomColor: isFocused ? (currentTheme === 'dark' ? UIStyles.dark.green : UIStyles.light.green) : (currentTheme === 'dark' ? UIStyles.dark.lightGrey : UIStyles.light.lightGrey),
    borderBottomWidth: 0.2,
    fontSize: 32,
    textAlign: 'center',
    fontFamily: 'MontserratBold',
}));

const FieldContainer = styled.View({
    flex: 1,
});

const ButtonsContainer = styled.View({
    marginLeft: -24,
    marginRight: -24,
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 18,
    paddingBottom: 18,
    borderTopWidth: 0.2,
    borderTopColor: currentTheme === 'dark' ? UIStyles.dark.dark : UIStyles.light.dark
});

const ButtonDefault = styled(CustomPressable)({
    width: '100%',
    padding: 21,
    alignItems: 'center',
    background: currentTheme === 'dark' ? UIStyles.dark.green : UIStyles.light.green,
    borderRadius: 12,
});

const ButtonDefaultText = styled.Text({
    fontSize: 16,
    fontFamily: 'MontserratSemiBold',
    color: currentTheme === 'dark' ? UIStyles.dark.white : UIStyles.light.white
});

const ButtonLink = styled(CustomPressable)({
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
});

const ButtonLinkText = styled.Text({
    fontSize: 16,
    fontFamily: 'MontserratSemiBold',
    color: currentTheme === 'dark' ? UIStyles.dark.green : UIStyles.light.green
});

export default Login;
