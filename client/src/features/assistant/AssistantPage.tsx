import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { ErrorAlert } from '../../components/ErrorAlert';
import { PageHeader } from '../../components/PageHeader';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { addUserMessage, sendPrompt } from './assistantSlice';

type AssistantForm = {
  prompt: string;
};

const examplePrompt = 'What do we need to prepare for next week?';

export const AssistantPage = () => {
  const dispatch = useAppDispatch();
  const { messages, status, error } = useAppSelector((state) => state.assistant);
  const { control, handleSubmit, reset, setValue } = useForm<AssistantForm>({
    defaultValues: {
      prompt: ''
    }
  });

  const submitPrompt = (values: AssistantForm) => {
    const prompt = values.prompt.trim();

    if (!prompt) {
      return;
    }

    dispatch(addUserMessage(prompt));
    dispatch(sendPrompt(prompt));
    reset();
  };

  return (
    <Box>
      <PageHeader
        title="AI Assistant"
        action={
          <Button
            variant="outlined"
            startIcon={<AutoAwesomeOutlinedIcon />}
            onClick={() => setValue('prompt', examplePrompt)}
          >
            Next week
          </Button>
        }
      />
      <Card variant="outlined">
        <CardContent sx={{ p: 0 }}>
          <Stack sx={{ height: { xs: 'calc(100vh - 220px)', md: 'calc(100vh - 190px)' }, minHeight: 520 }}>
            <Stack spacing={2} sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: { xs: '100%', md: '72%' },
                    bgcolor: message.role === 'user' ? 'primary.main' : 'action.hover',
                    color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                    px: 2,
                    py: 1.5,
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                </Box>
              ))}
              {status === 'loading' && (
                <Typography color="text.secondary" variant="body2">
                  Drafting summary
                </Typography>
              )}
              <ErrorAlert message={error} />
            </Stack>
            <Divider />
            <Stack
              component="form"
              direction="row"
              spacing={1}
              sx={{ p: { xs: 1.5, sm: 2 } }}
              onSubmit={handleSubmit(submitPrompt)}
            >
              <Controller
                name="prompt"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    placeholder={examplePrompt}
                    size="small"
                    fullWidth
                    multiline
                    maxRows={3}
                  />
                )}
              />
              <IconButton
                type="submit"
                color="primary"
                sx={{ border: 1, borderColor: 'divider', width: 40, height: 40 }}
                disabled={status === 'loading'}
              >
                <SendOutlinedIcon />
              </IconButton>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
