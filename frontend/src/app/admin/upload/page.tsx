"use client";

import { useState } from 'react';
import { Container, Title, Paper, Text, Group, Button, Select, Alert, Loader } from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { IconUpload, IconFileSpreadsheet, IconX, IconCheck } from '@tabler/icons-react';
import { API_BASE_URL } from '@/services/api';

export default function AdminUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [media, setMedia] = useState<string>('Meta');
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{ success: boolean, message: string } | null>(null);

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('media', media);

        try {
            const response = await fetch(`${API_BASE_URL}/upload?media=${media}`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setResult({ success: true, message: data.message });
                setFile(null);
            } else {
                setResult({ success: false, message: data.detail || 'Upload failed' });
            }
        } catch (error: any) {
            setResult({ success: false, message: error.message || 'Network error' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title order={2} mb="xl">Data Upload (Admin)</Title>

            <Paper shadow="sm" radius="md" p="xl" withBorder>
                <Select
                    label="Select Ad Platform"
                    description="Identify which media platform this spreadsheet belongs to"
                    data={['Meta', 'Google', 'Naver', 'Kakao', 'Toss']}
                    value={media}
                    onChange={(val) => setMedia(val || 'Meta')}
                    mb="xl"
                    required
                />

                <Dropzone
                    onDrop={(files) => setFile(files[0])}
                    onReject={(files) => console.log('rejected files', files)}
                    maxSize={5 * 1024 ** 2}
                    accept={[
                        MIME_TYPES.csv,
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'application/vnd.ms-excel',
                    ]}
                    mb="xl"
                >
                    <Group justify="center" gap="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
                        <Dropzone.Accept>
                            <IconUpload size={50} stroke={1.5} color="var(--mantine-color-blue-6)" />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                            <IconX size={50} stroke={1.5} color="var(--mantine-color-red-6)" />
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                            <IconFileSpreadsheet size={50} stroke={1.5} />
                        </Dropzone.Idle>

                        <div>
                            <Text size="xl" inline>
                                {file ? file.name : "Drag Excel/CSV file here or click to select file"}
                            </Text>
                            <Text size="sm" c="dimmed" inline mt={7}>
                                Attach one .xlsx or .csv file. Max size 5MB.
                            </Text>
                        </div>
                    </Group>
                </Dropzone>

                {result && (
                    <Alert
                        icon={result.success ? <IconCheck size={16} /> : <IconX size={16} />}
                        title={result.success ? "Success" : "Error"}
                        color={result.success ? "green" : "red"}
                        mb="xl"
                    >
                        {result.message}
                    </Alert>
                )}

                <Group justify="flex-end">
                    <Button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        leftSection={uploading && <Loader size="xs" color="white" />}
                    >
                        {uploading ? 'Processing...' : 'Upload Data'}
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
}
