import { Button, Rows, Text } from '@canva/app-ui-kit';
// import { addNativeElement } from "@canva/design";
import styles from 'styles/components.css';
import { useOverlay } from 'utils/use_overlay_hook';

export const App = () => {
  const overlay = useOverlay('image_selection');
  console.log(`🚧 || overlay`, overlay);

  const onClick = () => {
    overlay.open();
  };

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing='2u'>
        <Text>
          These are some examples of when an overlay can't be opened:
          <br />
          - an image isn't selected
          <br />
          - more than one image is selected
          <br />- an overlay is already open
        </Text>
        <Button
          variant='primary'
          disabled={!overlay.canOpen}
          onClick={onClick}
          stretch
        >
          use overlay
        </Button>
      </Rows>
    </div>
  );
};
