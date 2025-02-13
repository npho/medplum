import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react';
import { act, fireEvent, render, RenderResult, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { BatchPage } from './BatchPage';

const medplum = new MockClient();

describe('BatchPage', () => {
  function setup(): RenderResult {
    return render(
      <MemoryRouter>
        <MedplumProvider medplum={medplum}>
          <BatchPage />
        </MedplumProvider>
      </MemoryRouter>
    );
  }

  test('Renders', async () => {
    setup();
    expect(screen.getByText('Batch Create')).toBeInTheDocument();
  });

  test('Submit file', async () => {
    const renderResult = setup();

    // Upload file
    await act(async () => {
      const fileInput = renderResult.container.querySelector('input[type="file"]') as HTMLInputElement;
      const files = [new File(['{"resourceType":"Patient"}'], 'patient.json', { type: 'application/json' })];
      fireEvent.change(fileInput, { target: { files } });
    });

    await waitFor(async () => expect(screen.getByText('Output')).toBeInTheDocument());
    expect(screen.getByText('Output')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Start over' })).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Start over' }));
    });
  });

  test('Submit JSON', async () => {
    setup();

    // Click on the JSON tab
    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: 'JSON' }));
    });

    // Enter JSON
    await act(async () => {
      fireEvent.change(screen.getByTestId('batch-input'), {
        target: {
          value: JSON.stringify({
            resourceType: 'Practitioner',
            id: '123',
            meta: {
              lastUpdated: '2020-01-01T00:00:00.000Z',
              author: {
                reference: 'Practitioner/111',
              },
            },
          }),
        },
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Submit'));
    });

    await waitFor(async () => expect(screen.getByText('Output')).toBeInTheDocument());
    expect(screen.getByText('Output')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Start over' })).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Start over' }));
    });
  });
});
