import {
  Box,
  Card,
  CardContent,
  Container,
  Divider,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import useSettingsStore from '../../store/useSettingsStore';

const FONT_SIZE_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export default function Settings() {
  const { mode, fontSize, setMode, setFontSize } = useSettingsStore();

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
          Settings
        </Typography>

        <Card>
          <CardContent>
            <Stack divider={<Divider />} spacing={0}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ py: 2 }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Dark mode
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Switch between light and dark theme
                  </Typography>
                </Box>
                <Switch
                  checked={mode === 'dark'}
                  onChange={(e) => setMode(e.target.checked ? 'dark' : 'light')}
                />
              </Stack>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ py: 2 }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Font size
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Adjust the text size across the app
                  </Typography>
                </Box>
                <ToggleButtonGroup
                  value={fontSize}
                  exclusive
                  onChange={(_, val) => val && setFontSize(val)}
                  size="small"
                >
                  {FONT_SIZE_OPTIONS.map((opt) => (
                    <ToggleButton key={opt.value} value={opt.value}>
                      {opt.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
