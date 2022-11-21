import { MediaQuery, Notification } from "@mantine/core";
import { useState } from "react";
import styles from "./SignIn.module.scss";
import SignInForm from "./SignInForm";
import Welcome from "./Welcome";

const SignInWrapper = () => {
  const [notification, setNotification] = useState<string | null>(null);
  return (
    <div className={styles.wrapper}>
      {notification !== null && (
        <Notification
          color="red"
          className={styles.notification}
          onClose={() => setNotification(null)}
        >
          {notification}
        </Notification>
      )}
      <div className={styles.frameLeft}>
        <MediaQuery query="(max-width: 800px)" styles={{ display: "none" }}>
          <div>
            <Welcome />
          </div>
        </MediaQuery>
      </div>
      <div className={styles.frameRight}>
        <SignInForm setNotification={setNotification} />
      </div>
    </div>
  );
};
// const SignInWrapper = () => {
//   return (
//     <div className={styles.wrapper}>
//       <Container size="xl">
//         <Grid justify="center" align="stretch">
//           <MediaQuery query="(max-width: 800px)" styles={{ display: "none" }}>
//             <Grid.Col span="auto">
//               <div>
//                 <Welcome />
//               </div>
//             </Grid.Col>
//           </MediaQuery>
//           <Grid.Col span="auto" style={{ backgroundColor: "#fff" }}>
//             <SignInForm />
//           </Grid.Col>
//         </Grid>
//       </Container>
//     </div>
//   );
// };

export default SignInWrapper;
