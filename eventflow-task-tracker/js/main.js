/*LOGIN AND SIGN UP*/

import { auth } from "./firebase-config.js";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

/*GSAP ANIMATION*/

const tl = gsap.timeline({})

/*ANIMATION FROM CENTER*/
tl.fromTo(
    '.login__content',
    {
        y: -800,
        scaleX: .2,
        scaleY: .5,
        opacity: 0
    },
    {
        y:0,
        scaleX: .2,
        scaleY: .5,
        opacity: 1,
        duration: 1.5,
        ease: 'power3.out'
    }
)

/*EXPAND VERTICALLY*/
tl.to(
    '.login__content',
    {
        scaleY: 1,
        duration: .6,
        ease: 'power3.out'
    }, '-=0.3'
)

/*EXPAND HORIZONTALLY*/
tl.to(
    '.login__content',
    {
        scaleX: 1,
        duration: .7,
        ease: 'power3.out'
    }, '-=0.2'
)

/*ANIMATED BACKGROUND IMG*/
tl.to(
    '.login__img',
    {
        scale: 1.08,
        duration: 5,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true,
        transformOrigin: 'center center'
    }
)

/*ANIMATED FORM*/
gsap.defaults({opacity: 0, y: -60, ease: 'power2.out', duration: 1.2})
gsap.from('.login__title', {delay: 2.5})
gsap.from('.login__form > *', {delay: 2.7, stagger: .2})
gsap.from('.login__img',{y:0, x:100, delay: 3.2, ease: 'elastic.out(1,0.6)'})

const signupBtn = document.getElementById("signup-btn")
const backLoginBtn = document.getElementById("back-login-btn")

const loginContainer = document.getElementById("login__container")
const signupContainer = document.getElementById("signup__container")

// SHOW SIGNUP
signupBtn.addEventListener("click", (e) => {
    e.preventDefault()

    gsap.to(loginContainer, {
        opacity: 0,
        y: -30,
        duration: .5,
        onComplete: () => {
            loginContainer.style.display = "none"

            signupContainer.style.display = "block"

            gsap.fromTo(
                signupContainer,
                {
                    opacity: 0,
                    y: 30
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: .5
                }
            )
        }
    })
})

// SHOW LOGIN
backLoginBtn.addEventListener("click", (e) => {
    e.preventDefault()

    gsap.to(signupContainer, {
        opacity: 0,
        y: -30,
        duration: .5,
        onComplete: () => {
            signupContainer.style.display = "none"

            loginContainer.style.display = "block"

            gsap.fromTo(
                loginContainer,
                {
                    opacity: 0,
                    y: 30
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: .5
                }
            )
        }
    })
})

const loginImageWrapper = document.querySelector(".login__image")

// SHOW SIGNUP
signupBtn.addEventListener("click", (e) => {
    e.preventDefault()

    loginImageWrapper.classList.add("login--signup")
    loginImageWrapper.classList.remove("login--login")
})

// SHOW LOGIN
backLoginBtn.addEventListener("click", (e) => {
    e.preventDefault()

    loginImageWrapper.classList.add("login--login")
    loginImageWrapper.classList.remove("login--signup")
})

const loginWrapper = document.body

signupBtn.addEventListener("click", (e) => {
    e.preventDefault()

    loginWrapper.classList.add("login--signup")
    loginWrapper.classList.remove("login--login")
})

backLoginBtn.addEventListener("click", (e) => {
    e.preventDefault()

    loginWrapper.classList.add("login--login")
    loginWrapper.classList.remove("login--signup")
})

/*===============================
  FIREBASE AUTH
================================*/

// Tracks whether we're in the middle of a signup, so the listener below
// doesn't redirect away before updateProfile() has saved the display name
let isSigningUp = false;

// If the user is already logged in, skip the login page entirely
onAuthStateChanged(auth, (user) => {
    if (user && !isSigningUp) {
        window.location.href = "dashboard.html"
    }
})

/*LOGIN BUTTON*/
const loginForm = document.querySelector("#login__container form")

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("login_email")
    const password = document.getElementById("login_password")
    const submitBtn = loginForm.querySelector(".login__button")

    if (!email.value || !password.value) return

    submitBtn.disabled = true

    try {
        await signInWithEmailAndPassword(auth, email.value, password.value)
        window.location.href = "dashboard.html"
    } catch (err) {
        alert(getAuthErrorMessage(err))
        submitBtn.disabled = false
    }
})

/*SIGN UP BUTTON*/
const signupForm = document.querySelector("#signup__container form")

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const firstName = document.getElementById("first_name")
    const lastName = document.getElementById("last_name")
    const email = document.getElementById("signup_email")
    const password = document.getElementById("signup_password")
    const confirmPassword = document.getElementById("confirm_password")
    const submitBtn = signupForm.querySelector(".login__button")

    if (!firstName.value || !email.value || !password.value) return

    if (password.value !== confirmPassword.value) {
        alert("Passwords do not match.")
        return
    }

    submitBtn.disabled = true
    isSigningUp = true

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)

        // Save their name so the rest of the app can greet them by name
        // instead of by email
        await updateProfile(userCredential.user, {
            displayName: `${firstName.value} ${lastName.value}`.trim()
        })

        window.location.href = "dashboard.html"
    } catch (err) {
        alert(getAuthErrorMessage(err))
        submitBtn.disabled = false
        isSigningUp = false
    }
})

// Friendlier messages for the most common Firebase Auth error codes
function getAuthErrorMessage(err) {
    switch (err.code) {
        case "auth/email-already-in-use":
            return "That email is already registered. Try logging in instead."
        case "auth/invalid-email":
            return "That email address doesn't look right."
        case "auth/weak-password":
            return "Password should be at least 6 characters."
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
            return "Incorrect email or password."
        default:
            return err.message
    }
}
