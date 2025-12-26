import streamlit as st
import google.generativeai as genai

st.set_page_config(page_title="Asistente Virtual", page_icon="💎")
st.title("💎 Asistente Virtual")

# --- PEGA TU CLAVE EN LOS SECRETS DE STREAMLIT ---
try:
    genai.configure(api_key=st.secrets["GOOGLE_API_KEY"])
except:
    st.error("⚠️ Falta la API Key. Ve a 'Advanced Settings' en Streamlit.")
    st.stop()

# --- MODELO ---
model = genai.GenerativeModel('gemini-1.5-flash')

# --- CHAT ---
if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

if prompt := st.chat_input("Escribe aquí..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    try:
        response = model.generate_content(prompt)
        with st.chat_message("assistant"):
            st.markdown(response.text)
        st.session_state.messages.append({"role": "assistant", "content": response.text})
    except Exception as e:
        st.error(f"Error: {e}")
