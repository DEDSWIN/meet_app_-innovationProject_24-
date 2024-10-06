'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useState, useEffect } from 'react';
import { encodePassphrase, generateRoomId, randomString } from '@/lib/client-utils';
import styles from '../styles/Home.module.css';

// function Tabs(props: React.PropsWithChildren<{}>) {
//   const searchParams = useSearchParams();
//   const tabIndex = searchParams?.get('tab') === 'custom' ? 1 : 0;

//   const router = useRouter();
//   function onTabSelected(index: number) {
//     const tab = index === 1 ? 'custom' : 'demo';
//     router.push(`/?tab=${tab}`);
//   }

//   let tabs = React.Children.map(props.children, (child, index) => {
//     return (
//       <button
//         className="lk-button"
//         onClick={() => {
//           if (onTabSelected) {
//             onTabSelected(index);
//           }
//         }}
//         aria-pressed={tabIndex === index}
//       >
//         {/* @ts-ignore */}
//         {child?.props.label}
//       </button>
//     );
//   });

//   return (
//     <div className={styles.tabContainer}>
//       <div className={styles.tabSelect}>{tabs}</div>
//       {/* @ts-ignore */}
//       {props.children[tabIndex]}
//     </div>
//   );
// }

// function DemoMeetingTab(props: { label: string }) {
//   const router = useRouter();
//   const [e2ee, setE2ee] = useState(false);
//   const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));
//   const startMeeting = () => {
//     if (e2ee) {
//       router.push(`/rooms/${generateRoomId()}#${encodePassphrase(sharedPassphrase)}`);
//     } else {
//       router.push(`/rooms/${generateRoomId()}`);
//     }
//   };
//   return (
//     <div className={styles.tabContent}>
//       <p style={{ margin: 0 }}>Try LiveKit Meet for free with our live demo project.</p>
//       <button style={{ marginTop: '1rem' }} className="lk-button" onClick={startMeeting}>
//         Start Meeting
//       </button>
//       <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
//         <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
//           <input
//             id="use-e2ee"
//             type="checkbox"
//             checked={e2ee}
//             onChange={(ev) => setE2ee(ev.target.checked)}
//           ></input>
//           <label htmlFor="use-e2ee">Enable end-to-end encryption</label>
//         </div>
//         {e2ee && (
//           <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
//             <label htmlFor="passphrase">Passphrase</label>
//             <input
//               id="passphrase"
//               type="password"
//               value={sharedPassphrase}
//               onChange={(ev) => setSharedPassphrase(ev.target.value)}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

function CustomConnectionTab(props: { label: string }) {
  const router = useRouter();

  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));
  const [token, setToken] = useState<string | null>(''); // Token state initialized to empty string
  const [loadingToken, setLoadingToken] = useState(false); // Loading state
  const [room, setRoom] = useState(''); // State for room input
  const [name, setName] = useState(''); // State for name input

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
  const onCreateRoom = async () => {
    if (room && name) {
      setLoadingToken(true);
      try {
        const resp = await fetch(`/api/get_lk_token?room=${room}&username=${name}`);
        console.log(resp);
        if (!resp.ok) {
          throw new Error('Failed to fetch token');
        }
        const data = await resp.json();
        setToken(data.token);
      } catch (error) {
        console.error('Error fetching token:', error);
        setToken(null);
      } finally {
        setLoadingToken(false);
        console.log(token);
      }
    } else {
      alert('Please fill in both room and name fields.');
    }
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (token) {
      if (e2ee) {
        router.push(
          `/custom/?liveKitUrl=${serverUrl}&token=${token}&name=${name}&room=${room}#${encodePassphrase(
            sharedPassphrase,
          )}`,
        );
      } else {
        router.push(`/custom/?liveKitUrl=${serverUrl}&token=${token}&name=${name}&room=${room}`);
      }
    }
  };

  return (
    <form className={styles.tabContent} onSubmit={onSubmit}>
      <p style={{ marginTop: 0 }}>
        Connect LiveKit Meet with a custom server using LiveKit Cloud or LiveKit Server.
      </p>
      <input
        id="room"
        name="room"
        required
        placeholder="Enter Room name (to be created)"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        disabled={loadingToken}
      />
      <textarea
        id="name"
        name="name"
        placeholder="Enter user Name"
        required
        rows={5}
        style={{ padding: '1px 2px', fontSize: 'inherit', lineHeight: 'inherit' }}
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loadingToken}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
          <input
            id="use-e2ee"
            type="checkbox"
            checked={e2ee}
            onChange={(ev) => setE2ee(ev.target.checked)}
            disabled={loadingToken}
          />
          <label htmlFor="use-e2ee">Enable end-to-end encryption</label>
        </div>
        {e2ee && (
          <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
            <label htmlFor="passphrase">Passphrase</label>
            <input
              id="passphrase"
              type="password"
              value={sharedPassphrase}
              onChange={(ev) => setSharedPassphrase(ev.target.value)}
              disabled={loadingToken}
            />
          </div>
        )}
      </div>

      <hr
        style={{ width: '100%', borderColor: 'rgba(255, 255, 255, 0.15)', marginBlock: '1rem' }}
      />

      {/* Create Room Button */}
      <button
        type="button"
        style={{ paddingInline: '1.25rem', width: '100%' }}
        className="lk-button"
        onClick={onCreateRoom}
        disabled={loadingToken}
      >
        {loadingToken ? 'Getting token...' : 'Create Room'}
      </button>

      {/* Connect button disabled until token is available */}
      <button
        style={{ paddingInline: '1.25rem', width: '100%' }}
        className="lk-button"
        type="submit"
        disabled={!token || loadingToken} // Disable until token is fetched
      >
        Connect
      </button>
    </form>
  );
}

export default function Page() {
  return (
    <>
      <main className={styles.main} data-lk-theme="default">
        <div className="header">
          <img src="/images/livekit-meet-home.svg" alt="LiveKit Meet" width="360" height="45" />
          <h2>
            Open source video conferencing app built on{' '}
            <a href="https://github.com/livekit/components-js?ref=meet" rel="noopener">
              LiveKit&nbsp;Components
            </a>
            ,{' '}
            <a href="https://livekit.io/cloud?ref=meet" rel="noopener">
              LiveKit&nbsp;Cloud
            </a>{' '}
            and Next.js.
          </h2>
        </div>
        <Suspense fallback="Loading">
          {/* <Tabs>
          <DemoMeetingTab label="Demo" /> */}
          <CustomConnectionTab label="Custom" />
          {/* </Tabs> */}
        </Suspense>
      </main>
      <footer data-lk-theme="default">
        Hosted on{' '}
        <a href="https://livekit.io/cloud?ref=meet" rel="noopener">
          LiveKit Cloud
        </a>
        . Source code on{' '}
        <a href="https://github.com/livekit/meet?ref=meet" rel="noopener">
          GitHub
        </a>
        .
      </footer>
    </>
  );
}
