clc;
close all;
clear;

%% Variables
m1 = 1;   % mean of the real component
m2 = 9;   % mean of the imaginary component
sigma = 8;
phi = -pi:0.001:pi;
s = sqrt(m1^2 + m2^2);
K = (s^2) / (2 * sigma^2);

%% Analytical of amplitude of rician
x = 0:0.01:100;
fa = zeros(size(x));
for j = 1:length(x)
    fa(j) = (x(j)/(sigma^2)) * besseli(0, x(j)*s/(sigma^2)) * exp(-(x(j)^2+s^2)/(2*sigma^2));
end 

figure;
plot(x, fa, 'g', 'LineWidth', 2);
N = 1e6;
rician_channel = m1 + sigma*(randn(1, N)) + 1i *(m2 + sigma*(randn(1, N)));
amp = abs(rician_channel);
num_bins = 100;
[counts1, edges1] = histcounts(amp, num_bins, 'Normalization', 'pdf');
bin_centers1 = (edges1(1:end-1) + edges1(2:end)) / 2;
hold on;
bar(bin_centers1, counts1, 'FaceColor', 'b', 'EdgeColor', 'none', 'FaceAlpha', 0.6);
xlabel('Amplitude');
ylabel('PDF');
title('PDF of amplitude in Rician Fading Channel');
legend('Analytical PDF', 'Simulation PDF');

%% Analytical PDF calculation of angle--Bp_Lathi_book  
f = zeros(size(phi));
for i = 1:length(phi)
    m_til = m1 * cos(phi(i)) + m2 * sin(phi(i));
    f(i) = (1/(2*pi) * exp(-s^2/(2*sigma^2))) + (m_til/(sqrt(2*pi)*sigma)) * exp((m_til^2-s^2)/(2*sigma^2)) * (qfunc(-m_til/sigma));
end

%% Simulation of angle
N = 1e6;
rician_channel = m1 + sigma*(randn(1, N)) + 1i *(m2 + sigma*(randn(1, N)));
r = rician_channel; 
% Compute the phase of the Rician channel
phase = angle(rician_channel);

% Histogram-based PDF estimation
num_bins = 100;
[counts, edges] = histcounts(phase, num_bins, 'Normalization', 'pdf');
bin_centers = (edges(1:end-1) + edges(2:end)) / 2;

% Plotting
figure;
hold on;
plot(phi, f, 'r', 'LineWidth', 2);
bar(bin_centers, counts, 'FaceColor', 'b', 'EdgeColor', 'none', 'FaceAlpha', 0.6);
hold off;
grid on;
xlabel('Phase (\phi)');
ylabel('PDF');
title('PDF of Phase in Rician Fading Channel');
legend('Analytical PDF', 'Simulation PDF');
