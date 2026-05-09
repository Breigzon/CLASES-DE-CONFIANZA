import React, { useState, useEffect } from 'react';
import { StellarWalletsKit, WalletNetwork, ALLOWED_WALLETS } from '@creit-tech/stellar-wallets-kit';
import { Server, TransactionBuilder, Asset, Operation, Networks } from '@stellar/stellar-sdk';

// 1. CONFIGURACIÓN INICIAL
const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: ALLOWED_WALLETS.FREIGHTER,
});

const server = new Server("https://horizon-testnet.stellar.org");
const PROFESOR_ADDRESS = "GBCOY52B3KTLUQ5V6T5MLFQSBJQATAU3A2L2N5INFKA7UQRHR5DKQ3ZP"; // Aquí iría la wallet del profe

export default function TrustPreU_App() {
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [studentsInGroup, setStudentsInGroup] = useState(12); // Simulación de alumnos

  // 2. CONECTAR BILLETERA FREIGHTER
  const connectWallet = async () => {
    try {
      const { address } = await kit.getAddress();
      setAddress(address);
    } catch (e) {
      alert("Error al conectar Freighter");
    }
  };

  // 3. LÓGICA DE PAGO CON DESCUENTO GRUPAL
  const payForClass = async () => {
    setLoading(true);
    try {
      // Si hay más de 10 alumnos, el precio baja de 10 a 5 XLM automáticamente
      const currentPrice = studentsInGroup > 10 ? "5" : "10";
      
      const account = await server.loadAccount(address);
      const transaction = new TransactionBuilder(account, { fee: "100" })
        .addOperation(Operation.payment({
          destination: PROFESOR_ADDRESS,
          asset: Asset.native(),
          amount: currentPrice, // Precio dinámico según el grupo
        }))
        .setNetwork(Networks.TESTNET)
        .setTimeout(30)
        .build();

      const { result } = await kit.signTransaction(transaction.toXDR());
      setTxHash(result);
      alert(`¡Pago exitoso! Pagaste solo ${currentPrice} XLM por el descuento grupal.`);
      
      // Actualizamos la "reputación" visualmente para la demo
      setStudentsInGroup(prev => prev + 1);
    } catch (e) {
      console.error(e);
      alert("Error en la transacción. Verifica tu saldo en Testnet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1>Clases de Confianza 🎓</h1>
        <p>Seguridad y Descuentos para Estudiantes Pre-Universitarios en Perú</p>
      </header>

      {!address ? (
        <button onClick={connectWallet} style={mainBtnStyle}>Conectar mi Billetera</button>
      ) : (
        <main style={mainContentStyle}>
          <p>📍 Wallet: <code>{address.slice(0, 4)}...{address.slice(-4)}</code></p>
          
          <div style={cardStyle}>
            <h3>Clase de Refuerzo: Álgebra</h3>
            <p><b>Profesor:</b> Universitario UNI (Reputación: ⭐ 4.8)</p>
            <hr />
            <p>Alumnos inscritos actualmente: <b>{studentsInGroup}</b></p>
            
            {studentsInGroup > 10 ? (
              <p style={promoStyle}>🔥 ¡DESCUENTO GRUPAL ACTIVO! Precio: 5 XLM</p>
            ) : (
              <p>Precio normal: 10 XLM</p>
            )}

            <button 
              onClick={payForClass} 
              disabled={loading} 
              style={loading ? disabledBtnStyle : payBtnStyle}
            >
              {loading ? "Procesando en Stellar..." : "Inscribirme con Stellar"}
            </button>

            {txHash && (
              <div style={successStyle}>
                <p>✅ ¡Inscripción confirmada!</p>
                <a href={`https://stellar.expert{txHash}`} target="_blank" rel="noreferrer">
                  Ver recibo en la Blockchain
                </a>
              </div>
            )}
          </div>
        </main>
      )}
      
      <footer style={footerStyle}>
        <p>MVP para Stellar Buildathon Lima 2026</p>
      </footer>
    </div>
  );
}

// 4. ESTILOS RÁPIDOS (CSS-in-JS)
const containerStyle: React.CSSProperties = { textAlign: 'center', padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh' };
const headerStyle = { marginBottom: '30px' };
const mainContentStyle = { backgroundColor: '#fff', padding: '20px', borderRadius: '15px', display: 'inline-block', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
const cardStyle = { marginTop: '20px', padding: '20px', border: '2px solid #FDDA24', borderRadius: '10px' };
const mainBtnStyle = { padding: '15px 30px', fontSize: '18px', backgroundColor: '#FDDA24', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const payBtnStyle = { ...mainBtnStyle, backgroundColor: '#000', color: '#fff', width: '100%' };
const disabledBtnStyle = { ...payBtnStyle, backgroundColor: '#ccc', cursor: 'not-allowed' };
const promoStyle = { color: '#e67e22', fontWeight: 'bold', fontSize: '1.1em' };
const successStyle = { marginTop: '15px', color: '#27ae60', fontSize: '0.9em' };
const footerStyle = { marginTop: '50px', fontSize: '0.8em', color: '#7f8c8d' };
