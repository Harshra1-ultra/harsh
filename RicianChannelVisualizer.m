function RicianChannelVisualizer
    % RICIANCHANNELVISUALIZER Launch the interactive Rician fading visualizer.
    %
    % This program creates a standalone, real-time interactive GUI dashboard
    % for visualizing the statistical properties of a Rician fading channel,
    % including underlying Gaussian components, complex plane sample scatter,
    % amplitude PDF, phase PDF, and polar sample coordinates.
    %
    % Run this function directly from the MATLAB command window:
    % >> RicianChannelVisualizer

    % ==========================================
    % DEFAULT PARAMETERS
    % ==========================================
    m1_init = 1.0;      % Mean of real component
    m2_init = 9.0;      % Mean of imaginary component
    sigma_init = 8.0;   % Std Dev of components
    N_init = 100000;    % Monte Carlo sample size (100k)
    bins_init = 100;    % Histogram bins
    
    % State variables
    live_update = true;
    current_N = N_init;
    
    % Generate initial data
    [samples, amp, phase, s, K, K_dB, mean_amp, var_amp] = computeData(m1_init, m2_init, sigma_init, current_N);
    
    % ==========================================
    % CREATE UI FIGURE & LAYOUT
    % ==========================================
    fig = uifigure('Name', 'Rician Fading Channel Visualization Dashboard', ...
                  'Position', [50, 50, 1300, 850], ...
                  'Color', [1 1 1]);
              
    % Main Grid Layout: 1 Row, 2 Columns (Control panel on left, Plots on right)
    mainGrid = uigridlayout(fig, [1, 2], 'ColumnWidth', {320, '1x'}, 'Padding', 10, 'Spacing', 10);
    
    % Left Panel: Controls Container
    controlPanel = uipanel(mainGrid, 'Title', 'Parameters & Configurations', ...
                           'FontWeight', 'bold', 'BackgroundColor', [1 1 1]);
    controlPanel.Layout.Row = 1;
    controlPanel.Layout.Column = 1;
    
    % Grid inside Control Panel
    controlGrid = uigridlayout(controlPanel, [18, 2], ...
                              'ColumnWidth', {'1.4x', '1x'}, ...
                              'RowHeight', {25, 25, 30, 25, 30, 25, 25, 30, 25, 25, 25, 30, 25, 120, 25, 25, 25, '1x'}, ...
                              'Padding', 10, 'Spacing', 5);
                          
    % Right Panel: Plots Grid
    plotsGrid = uigridlayout(mainGrid, [3, 2], ...
                            'RowHeight', {'1x', '1x', '1x'}, ...
                            'ColumnWidth', {'1x', '1x'}, ...
                            'Padding', 5, 'Spacing', 15);
                        
    % ==========================================
    % INITIALIZE PLOT AXES
    % ==========================================
    % 1. Gaussians Axes
    axGauss = uiaxes(plotsGrid, 'Title', 'Underlying Gaussian Components', ...
                     'FontName', 'Inter', 'FontSize', 9);
    axGauss.Layout.Row = 1; axGauss.Layout.Column = 1;
    grid(axGauss, 'on'); hold(axGauss, 'on');
    xlabel(axGauss, 'Component Value'); ylabel(axGauss, 'Probability Density');
    
    % 2. Complex Scatter Axes
    axComplex = uiaxes(plotsGrid, 'Title', 'Complex Sample Plane', ...
                       'FontName', 'Inter', 'FontSize', 9);
    axComplex.Layout.Row = 1; axComplex.Layout.Column = 2;
    grid(axComplex, 'on'); hold(axComplex, 'on');
    xlabel(axComplex, 'Real Part'); ylabel(axComplex, 'Imaginary Part');
    
    % 3. Amplitude PDF Axes
    axAmp = uiaxes(plotsGrid, 'Title', 'Amplitude PDF (Rician)', ...
                   'FontName', 'Inter', 'FontSize', 9);
    axAmp.Layout.Row = 2; axAmp.Layout.Column = 1;
    grid(axAmp, 'on'); hold(axAmp, 'on');
    xlabel(axAmp, 'Amplitude'); ylabel(axAmp, 'Probability Density');
    
    % 4. Phase PDF Axes
    axPhase = uiaxes(plotsGrid, 'Title', 'Phase PDF', ...
                     'FontName', 'Inter', 'FontSize', 9);
    axPhase.Layout.Row = 2; axPhase.Layout.Column = 2;
    grid(axPhase, 'on'); hold(axPhase, 'on');
    xlabel(axPhase, 'Phase (radians)'); ylabel(axPhase, 'Probability Density');
    axPhase.XLim = [-pi, pi];
    
    % 5. Polar Axes Container Panel
    polarContainer = uipanel(plotsGrid, 'BorderType', 'none', 'BackgroundColor', [1 1 1]);
    polarContainer.Layout.Row = 3; polarContainer.Layout.Column = 1;
    % Create Polar Axes manually
    axPolar = polaraxes(polarContainer);
    title(axPolar, 'Polar Coordinates Distribution', 'FontSize', 9, 'FontName', 'Inter');
    axPolar.ThetaZeroLocation = 'Right';
    axPolar.ThetaDir = 'counterclockwise';
    
    % Resize polar axes to fit container panel nicely
    polarContainer.SizeChangedFcn = @(src, ev) set(axPolar, 'Position', [0.1 0.05 0.8 0.85]);
    
    % 6. Educational Panel
    eduPanel = uipanel(plotsGrid, 'Title', 'Rician Fading Channel Insights', ...
                       'FontWeight', 'bold', 'BackgroundColor', [1 1 1]);
    eduPanel.Layout.Row = 3; eduPanel.Layout.Column = 2;
    eduGrid = uigridlayout(eduPanel, [1, 1], 'Padding', 5);
    eduText = uitextarea(eduGrid, 'Editable', 'off', 'FontName', 'Inter', 'FontSize', 9, ...
        'Value', { ...
            '• Rician fading characterizes propagation channels with a strong direct Line-of-Sight (LOS) signal component accompanied by random multi-path scatters.', ...
            '', ...
            '• Gaussian Components: The channel is modeled as h = X + iY where X ~ N(m1, s^2) and Y ~ N(m2, s^2) are independent Gaussian processes representing the real and imaginary scatter components.', ...
            '', ...
            '• LOS Parameter (s): s = sqrt(m1^2 + m2^2) represents the amplitude of the dominant specular path.', ...
            '', ...
            '• K-factor: K = s^2 / (2 * s^2) describes the ratio of the specular path power to the scattered paths power. K (dB) = 10 * log10(K).', ...
            '', ...
            '• Rayleigh Fading Limit: When K = 0 (means m1 = m2 = 0), Rician fading simplifies exactly to Rayleigh fading. The phase becomes uniform over [-pi, pi].', ...
            '', ...
            '• High K Limit: As K increases, the amplitude distribution becomes increasingly symmetric and Gaussian-like around s, and the phase becomes highly concentrated around angle(m1 + i*m2).' ...
        });

    % ==========================================
    % CREATE CONTROL WIDGETS
    % ==========================================
    
    % Row 1: Section Header
    uilabel(controlGrid, 'Text', 'Underlying Gaussian Means', 'FontWeight', 'bold', ...
            'FontName', 'Outfit', 'FontSize', 11).Layout.Column = [1 2];
        
    % Row 2: Real Mean m1 Label & Edit Field
    uilabel(controlGrid, 'Text', 'Real Mean (m1):', 'FontName', 'Inter');
    m1_edit = uineditfield(controlGrid, 'Value', m1_init, 'Limits', [-20 20], ...
                           'ValueChangedFcn', @m1EditCallback);
                       
    % Row 3: Real Mean m1 Slider
    m1_slider = uislider(controlGrid, 'Limits', [-20 20], 'Value', m1_init, ...
                         'ValueChangedFcn', @m1SliderCallback);
    m1_slider.Layout.Column = [1 2];
    
    % Row 4: Imaginary Mean m2 Label & Edit Field
    uilabel(controlGrid, 'Text', 'Imag Mean (m2):', 'FontName', 'Inter');
    m2_edit = uineditfield(controlGrid, 'Value', m2_init, 'Limits', [-20 20], ...
                           'ValueChangedFcn', @m2EditCallback);
                       
    % Row 5: Imaginary Mean m2 Slider
    m2_slider = uislider(controlGrid, 'Limits', [-20 20], 'Value', m2_init, ...
                         'ValueChangedFcn', @m2SliderCallback);
    m2_slider.Layout.Column = [1 2];
    
    % Row 6: Section Header 2
    uilabel(controlGrid, 'Text', 'Channel Standard Deviation', 'FontWeight', 'bold', ...
            'FontName', 'Outfit', 'FontSize', 11).Layout.Column = [1 2];
        
    % Row 7: Std Dev sigma Label & Edit Field
    uilabel(controlGrid, 'Text', 'Std Dev (\sigma):', 'FontName', 'Inter');
    sigma_edit = uineditfield(controlGrid, 'Value', sigma_init, 'Limits', [0.1 20], ...
                              'ValueChangedFcn', @sigmaEditCallback);
                          
    % Row 8: Std Dev sigma Slider
    sigma_slider = uislider(controlGrid, 'Limits', [0.1 20], 'Value', sigma_init, ...
                            'ValueChangedFcn', @sigmaSliderCallback);
    sigma_slider.Layout.Column = [1 2];
    
    % Row 9: Section Header 3
    uilabel(controlGrid, 'Text', 'Simulation Configurations', 'FontWeight', 'bold', ...
            'FontName', 'Outfit', 'FontSize', 11).Layout.Column = [1 2];
        
    % Row 10: Samples N Dropdown
    uilabel(controlGrid, 'Text', 'Sample Size (N):', 'FontName', 'Inter');
    n_drop = uidropdown(controlGrid, 'Items', {'1,000', '10,000', '100,000', '1,000,000'}, ...
                        'ItemsData', [1000, 10000, 100000, 1000000], 'Value', N_init, ...
                        'ValueChangedFcn', @nDropdownCallback);
                    
    % Row 11: Bins Label & Edit Field
    uilabel(controlGrid, 'Text', 'Histogram Bins:', 'FontName', 'Inter');
    bins_edit = uineditfield(controlGrid, 'Value', bins_init, 'Limits', [20 300], ...
                            'RoundFractionalValues', 'on', 'ValueChangedFcn', @binsEditCallback);
                        
    % Row 12: Bins Slider
    bins_slider = uislider(controlGrid, 'Limits', [20 300], 'Value', bins_init, ...
                           'ValueChangedFcn', @binsSliderCallback);
    bins_slider.Layout.Column = [1 2];
    
    % Row 13: Derived Parameters Header
    uilabel(controlGrid, 'Text', 'Derived Channel Parameters', 'FontWeight', 'bold', ...
            'FontName', 'Outfit', 'FontSize', 11).Layout.Column = [1 2];
        
    % Row 14: Derived Info Text Box (using a read-only list/box)
    derivedBox = uitextarea(controlGrid, 'Editable', 'off', 'FontName', 'Monospaced', ...
                            'FontSize', 9);
    derivedBox.Layout.Column = [1 2];
    
    % Row 15: Action buttons grid layout (inside control panel grid cell)
    btnLayout = uigridlayout(controlGrid, [2, 2], 'Padding', 0, 'Spacing', 5);
    btnLayout.Layout.Column = [1 2];
    btnLayout.Layout.Row = 15;
    
    reset_btn = uibutton(btnLayout, 'Text', 'Reset Parameters', 'ButtonPushedFcn', @resetButtonCallback);
    resample_btn = uibutton(btnLayout, 'Text', 'Resample', 'ButtonPushedFcn', @resampleButtonCallback);
    pause_btn = uibutton(btnLayout, 'Text', 'Pause Updates', 'ButtonPushedFcn', @pauseButtonCallback);
    export_btn = uibutton(btnLayout, 'Text', 'Export Figure', 'ButtonPushedFcn', @exportButtonCallback);

    % ==========================================
    % DRAW INITIAL PLOTS (INSTANTIATION)
    % ==========================================
    % 1. Gaussians Plot
    x_g = linspace(min(m1_init, m2_init) - 4*sigma_init, max(m1_init, m2_init) + 4*sigma_init, 200);
    g1_line = plot(axGauss, x_g, normpdf(x_g, m1_init, sigma_init), 'g-', 'LineWidth', 2);
    g2_line = plot(axGauss, x_g, normpdf(x_g, m2_init, sigma_init), 'b-', 'LineWidth', 1.5);
    legend(axGauss, {'Real Component', 'Imaginary Component'}, 'Location', 'northeast', 'FontSize', 8);
    
    % 2. Complex Scatter
    scat_N = min(5000, length(samples));
    scat_idx = round(linspace(1, length(samples), scat_N));
    scatter_pts = scatter(axComplex, real(samples(scat_idx)), imag(samples(scat_idx)), 3, ...
                          'MarkerEdgeColor', [0.2 0.5 0.95], 'MarkerFaceColor', [0.2 0.5 0.95], ...
                          'MarkerFaceAlpha', 0.2, 'MarkerEdgeAlpha', 0.2);
    mean_marker = plot(axComplex, m1_init, m2_init, 'kx', 'LineWidth', 2, 'MarkerSize', 12);
    
    theta = linspace(0, 2*pi, 100);
    ellipse1 = plot(axComplex, m1_init + sigma_init*cos(theta), m2_init + sigma_init*sin(theta), ...
                    'k--', 'LineWidth', 1.2);
    ellipse2 = plot(axComplex, m1_init + 2*sigma_init*cos(theta), m2_init + 2*sigma_init*sin(theta), ...
                    'r--', 'LineWidth', 1.2);
    legend(axComplex, {'Samples', 'Mean', '1-sigma Circle', '2-sigma Circle'}, 'Location', 'best', 'FontSize', 8);
    
    % 3. Amplitude PDF
    [counts_amp, edges_amp] = histcounts(amp, bins_init, 'Normalization', 'pdf');
    bin_c_amp = (edges_amp(1:end-1) + edges_amp(2:end)) / 2;
    amp_bars = bar(axAmp, bin_c_amp, counts_amp, 1, 'FaceColor', [0.1 0.4 0.9], 'EdgeColor', 'none', 'FaceAlpha', 0.5);
    
    max_val_amp = max(amp);
    x_amp = linspace(0, max_val_amp + 5, 300);
    fa_init = (x_amp ./ (sigma_init^2)) .* besseli(0, x_amp .* s ./ (sigma_init^2)) .* exp(-(x_amp.^2 + s^2) ./ (2 * sigma_init^2));
    amp_line = plot(axAmp, x_amp, fa_init, 'r-', 'LineWidth', 2);
    legend(axAmp, {'Simulation PDF', 'Analytical Rician PDF'}, 'Location', 'northeast', 'FontSize', 8);
    
    % 4. Phase PDF
    [counts_ph, edges_ph] = histcounts(phase, bins_init, 'Normalization', 'pdf');
    bin_c_ph = (edges_ph(1:end-1) + edges_ph(2:end)) / 2;
    phase_bars = bar(axPhase, bin_c_ph, counts_ph, 1, 'FaceColor', [0.1 0.4 0.9], 'EdgeColor', 'none', 'FaceAlpha', 0.5);
    
    phi_range = linspace(-pi, pi, 200);
    m_til = m1_init * cos(phi_range) + m2_init * sin(phi_range);
    f_phi_init = (1/(2*pi) * exp(-s^2/(2*sigma_init^2))) + ...
                 (m_til ./ (sqrt(2*pi) * sigma_init)) .* exp((m_til.^2 - s^2) ./ (2 * sigma_init^2)) .* my_qfunc(-m_til ./ sigma_init);
    phase_line = plot(axPhase, phi_range, f_phi_init, 'r-', 'LineWidth', 2);
    legend(axPhase, {'Simulation PDF', 'Analytical PDF'}, 'Location', 'northeast', 'FontSize', 8);
    
    % 5. Polar Axes Plot
    polar_scatter_pts = polarscatter(axPolar, phase(scat_idx), amp(scat_idx), 2, [0.1 0.4 0.9], 'filled');
    polar_scatter_pts.MarkerFaceAlpha = 0.15;
    
    % Fill Derived Text Box
    updateDerivedText(s, K, K_dB, mean_amp, var_amp);
    
    % Set axis limits initially
    axComplex.XLim = [m1_init - 3*sigma_init, m1_init + 3*sigma_init];
    axComplex.YLim = [m2_init - 3*sigma_init, m2_init + 3*sigma_init];

    % ==========================================
    % CALLBACK FUNCTIONS
    % ==========================================
    
    % m1 callbacks
    function m1SliderCallback(src, event)
        m1_edit.Value = m1_slider.Value;
        updatePlots();
    end
    function m1EditCallback(src, event)
        m1_slider.Value = m1_edit.Value;
        updatePlots();
    end

    % m2 callbacks
    function m2SliderCallback(src, event)
        m2_edit.Value = m2_slider.Value;
        updatePlots();
    end
    function m2EditCallback(src, event)
        m2_slider.Value = m2_edit.Value;
        updatePlots();
    end

    % sigma callbacks
    function sigmaSliderCallback(src, event)
        sigma_edit.Value = sigma_slider.Value;
        updatePlots();
    end
    function sigmaEditCallback(src, event)
        sigma_slider.Value = sigma_edit.Value;
        updatePlots();
    end

    % bins callbacks
    function binsSliderCallback(src, event)
        bins_edit.Value = round(bins_slider.Value);
        updatePlots();
    end
    function binsEditCallback(src, event)
        bins_slider.Value = bins_edit.Value;
        updatePlots();
    end

    % N Dropdown Callback
    function nDropdownCallback(src, event)
        current_N = n_drop.Value;
        updatePlots();
    end

    % Reset Button
    function resetButtonCallback(src, event)
        m1_edit.Value = m1_init; m1_slider.Value = m1_init;
        m2_edit.Value = m2_init; m2_slider.Value = m2_init;
        sigma_edit.Value = sigma_init; sigma_slider.Value = sigma_init;
        bins_edit.Value = bins_init; bins_slider.Value = bins_init;
        n_drop.Value = N_init;
        current_N = N_init;
        updatePlots();
    end

    % Resample Button
    function resampleButtonCallback(src, event)
        updatePlots();
    end

    % Pause/Resume button
    function pauseButtonCallback(src, event)
        if live_update
            live_update = false;
            pause_btn.Text = 'Resume Updates';
            pause_btn.BackgroundColor = [0.9 0.9 0.7];
        else
            live_update = true;
            pause_btn.Text = 'Pause Updates';
            pause_btn.BackgroundColor = '';
            updatePlots();
        end
    end

    % Export Figure Button
    function exportButtonCallback(src, event)
        export_fig = figure('Name', 'Exported Rician Fading Channel Plots', ...
                            'Units', 'normalized', 'Position', [0.1, 0.1, 0.8, 0.8]);
        
        % Subplot 1: Gaussians
        ax1 = subplot(2,2,1); grid on; hold on;
        x_ex = linspace(min(m1_slider.Value, m2_slider.Value) - 4*sigma_slider.Value, max(m1_slider.Value, m2_slider.Value) + 4*sigma_slider.Value, 200);
        plot(ax1, x_ex, normpdf(x_ex, m1_slider.Value, sigma_slider.Value), 'g-', 'LineWidth', 2);
        plot(ax1, x_ex, normpdf(x_ex, m2_slider.Value, sigma_slider.Value), 'b-', 'LineWidth', 1.5);
        title('Underlying Gaussian Components'); xlabel('Component Value'); ylabel('PDF');
        legend({'Real Component', 'Imaginary Component'});
        
        % Subplot 2: Complex Scatter
        ax2 = subplot(2,2,2); grid on; hold on;
        scatter(ax2, real(samples(scat_idx)), imag(samples(scat_idx)), 4, 'filled', ...
                'MarkerFaceColor', [0.1 0.4 0.9], 'MarkerFaceAlpha', 0.25);
        plot(ax2, m1_slider.Value, m2_slider.Value, 'kx', 'LineWidth', 2, 'MarkerSize', 12);
        plot(ax2, m1_slider.Value + sigma_slider.Value*cos(theta), m2_slider.Value + sigma_slider.Value*sin(theta), 'k--', 'LineWidth', 1.2);
        plot(ax2, m1_slider.Value + 2*sigma_slider.Value*cos(theta), m2_slider.Value + 2*sigma_slider.Value*sin(theta), 'r--', 'LineWidth', 1.2);
        title('Complex Sample Plane'); xlabel('Real'); ylabel('Imaginary');
        legend({'Samples', 'Mean', '1-\sigma Circle', '2-\sigma Circle'});
        
        % Subplot 3: Amplitude
        ax3 = subplot(2,2,3); grid on; hold on;
        [c_a, e_a] = histcounts(amp, bins_slider.Value, 'Normalization', 'pdf');
        b_a = (e_a(1:end-1) + e_a(2:end)) / 2;
        bar(ax3, b_a, c_a, 1, 'FaceColor', [0.1 0.4 0.9], 'EdgeColor', 'none', 'FaceAlpha', 0.5);
        plot(ax3, x_amp, (x_amp ./ (sigma_slider.Value^2)) .* besseli(0, x_amp .* s ./ (sigma_slider.Value^2)) .* exp(-(x_amp.^2 + s^2) ./ (2 * sigma_slider.Value^2)), 'r-', 'LineWidth', 2);
        title('Amplitude PDF (Rician)'); xlabel('Amplitude'); ylabel('PDF');
        legend({'Simulation', 'Analytical'});
        
        % Subplot 4: Phase
        ax4 = subplot(2,2,4); grid on; hold on;
        [c_p, e_p] = histcounts(phase, bins_slider.Value, 'Normalization', 'pdf');
        b_p = (e_p(1:end-1) + e_p(2:end)) / 2;
        bar(ax4, b_p, c_p, 1, 'FaceColor', [0.1 0.4 0.9], 'EdgeColor', 'none', 'FaceAlpha', 0.5);
        plot(ax4, phi_range, (1/(2*pi) * exp(-s^2/(2*sigma_slider.Value^2))) + (m_til ./ (sqrt(2*pi) * sigma_slider.Value)) .* exp((m_til.^2 - s^2) ./ (2 * sigma_slider.Value^2)) .* my_qfunc(-m_til ./ sigma_slider.Value), 'r-', 'LineWidth', 2);
        title('Phase PDF'); xlabel('Phase (rad)'); ylabel('PDF');
        legend({'Simulation', 'Analytical'});
        
        msgbox('Plots successfully exported to a standard MATLAB Figure window! You can now customize, print, or save them directly.', 'Export Success');
    end

    % ==========================================
    % REAL-TIME UPDATE LOGIC
    % ==========================================
    function updatePlots()
        if ~live_update, return; end
        
        % Read current parameters
        m1_v = m1_edit.Value;
        m2_v = m2_edit.Value;
        sig_v = sigma_edit.Value;
        b_v = bins_edit.Value;
        
        % Re-compute derived parameters and samples
        [samples, amp, phase, s, K, K_dB, mean_amp, var_amp] = computeData(m1_v, m2_v, sig_v, current_N);
        
        % Update text boxes
        updateDerivedText(s, K, K_dB, mean_amp, var_amp);
        
        % 1. Update Gaussians Axes
        x_g = linspace(min(m1_v, m2_v) - 4*sig_v, max(m1_v, m2_v) + 4*sig_v, 200);
        g1_line.XData = x_g; g1_line.YData = normpdf(x_g, m1_v, sig_v);
        g2_line.XData = x_g; g2_line.YData = normpdf(x_g, m2_v, sig_v);
        axGauss.XLim = [min(x_g), max(x_g)];
        
        % 2. Update Complex Scatter & Ellipse
        scat_N = min(5000, length(samples));
        scat_idx = round(linspace(1, length(samples), scat_N));
        scatter_pts.XData = real(samples(scat_idx));
        scatter_pts.YData = imag(samples(scat_idx));
        mean_marker.XData = m1_v;
        mean_marker.YData = m2_v;
        
        ellipse1.XData = m1_v + sig_v * cos(theta);
        ellipse1.YData = m2_v + sig_v * sin(theta);
        ellipse2.XData = m1_v + 2 * sig_v * cos(theta);
        ellipse2.YData = m2_v + 2 * sig_v * sin(theta);
        
        axComplex.XLim = [m1_v - 3.2*sig_v, m1_v + 3.2*sig_v];
        axComplex.YLim = [m2_v - 3.2*sig_v, m2_v + 3.2*sig_v];
        
        % 3. Update Amplitude PDF
        [counts_amp, edges_amp] = histcounts(amp, b_v, 'Normalization', 'pdf');
        bin_c_amp = (edges_amp(1:end-1) + edges_amp(2:end)) / 2;
        delete(amp_bars);
        hold(axAmp, 'on');
        amp_bars = bar(axAmp, bin_c_amp, counts_amp, 1, 'FaceColor', [0.1 0.4 0.9], 'EdgeColor', 'none', 'FaceAlpha', 0.5);
        
        max_val_amp = max(amp);
        x_amp = linspace(0, max_val_amp + 5, 300);
        fa = (x_amp ./ (sig_v^2)) .* besseli(0, x_amp .* s ./ (sig_v^2)) .* exp(-(x_amp.^2 + s^2) ./ (2 * sig_v^2));
        amp_line.XData = x_amp;
        amp_line.YData = fa;
        axAmp.XLim = [0, max(x_amp)];
        uistack(amp_line, 'top');
        
        % 4. Update Phase PDF
        [counts_ph, edges_ph] = histcounts(phase, b_v, 'Normalization', 'pdf');
        bin_c_ph = (edges_ph(1:end-1) + edges_ph(2:end)) / 2;
        delete(phase_bars);
        hold(axPhase, 'on');
        phase_bars = bar(axPhase, bin_c_ph, counts_ph, 1, 'FaceColor', [0.1 0.4 0.9], 'EdgeColor', 'none', 'FaceAlpha', 0.5);
        
        m_til = m1_v * cos(phi_range) + m2_v * sin(phi_range);
        f_phi = (1/(2*pi) * exp(-s^2/(2*sig_v^2))) + ...
                (m_til ./ (sqrt(2*pi) * sig_v)) .* exp((m_til.^2 - s^2) ./ (2 * sig_v^2)) .* my_qfunc(-m_til ./ sig_v);
        phase_line.XData = phi_range;
        phase_line.YData = f_phi;
        uistack(phase_line, 'top');
        
        % 5. Update Polar Plot
        delete(polar_scatter_pts);
        hold(axPolar, 'on');
        polar_scatter_pts = polarscatter(axPolar, phase(scat_idx), amp(scat_idx), 2, [0.1 0.4 0.9], 'filled');
        polar_scatter_pts.MarkerFaceAlpha = 0.15;
    end

    % Helper: Derived Parameters textbox updater
    function updateDerivedText(s, K, K_dB, m_a, v_a)
        derivedBox.Value = {
            sprintf(' Specular Path (s): %.4f', s);
            sprintf(' K-factor (linear): %.4f', K);
            sprintf(' K-factor (dB)    : %.2f dB', K_dB);
            sprintf(' Mean Amplitude   : %.4f', m_a);
            sprintf(' Var Amplitude    : %.4f', v_a);
            sprintf(' Noise Variance   : %.4f (2*sig^2)', 2 * sigma_edit.Value^2);
        };
    end

end

% ==========================================
% DATA PROCESSING & STATISTICAL FUNCTIONS
% ==========================================
function [samples, amp, phase, s, K, K_dB, mean_amp, var_amp] = computeData(m1, m2, sigma, N)
    % Generate independent real and imaginary Gaussian components
    x = m1 + sigma * randn(1, N);
    y = m2 + sigma * randn(1, N);
    
    % Form complex envelope
    samples = x + 1i * y;
    
    % Envelop amplitude & phase
    amp = abs(samples);
    phase = angle(samples);
    
    % Compute derived parameters
    s = sqrt(m1^2 + m2^2);
    K = (s^2) / (2 * sigma^2);
    K_dB = 10 * log10(K);
    
    % Statistical mean and variance
    mean_amp = mean(amp);
    var_amp = var(amp);
end

% ==========================================
% REUSABLE MATH FALLBACKS (NO TOOLBOX REQUIRED)
% ==========================================
function y = normpdf(x, mu, sigma)
    % Gaussian PDF helper
    y = exp(-((x - mu).^2) ./ (2 * sigma^2)) ./ (sqrt(2*pi) * sigma);
end

function q = my_qfunc(x)
    % Q-function computed via complementary error function
    q = 0.5 * erfc(x ./ sqrt(2));
end
